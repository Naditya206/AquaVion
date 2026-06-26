import http from "http";
import { URL } from "url";

const HADOOP_WEBHDFS_URL = (process.env.HADOOP_WEBHDFS_URL || "http://localhost:9870/webhdfs/v1").replace(/\/+$/, "");
const HADOOP_USER = process.env.HADOOP_USER || "hadoop";
const ENABLE_HADOOP = process.env.ENABLE_HADOOP === "true";

// Custom helper to make HTTP requests using Node's native 'http' module.
// This is critical because Next.js's default 'fetch' (powered by undici)
// crashes with SocketError (bad response) when handling HTTP 100 Continue responses from HDFS DataNode.
function nativeHttpRequest(
  urlStr: string,
  options: {
    method: string;
    headers?: Record<string, string>;
    body?: string;
    timeout?: number;
  }
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlStr);
      const requestOptions: http.RequestOptions = {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname + url.search,
        method: options.method,
        headers: options.headers || {},
      };

      const req = http.request(requestOptions, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body: data,
          });
        });
      });

      if (options.timeout) {
        req.setTimeout(options.timeout, () => {
          req.destroy(new Error("Request timeout"));
        });
      }

      req.on("error", (err) => {
        reject(err);
      });

      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Helper to check if Hadoop is enabled and online
export async function isHadoopOnline(): Promise<boolean> {
  if (!ENABLE_HADOOP) return false;
  try {
    const url = `${HADOOP_WEBHDFS_URL}?op=GETHOMEDIRECTORY&user.name=${HADOOP_USER}`;
    const res = await nativeHttpRequest(url, { method: "GET", timeout: 3000 });
    return res.status === 200;
  } catch (e) {
    return false;
  }
}

// Map docker internal hosts or local computer names (like MSI) to localhost to avoid Node.js DNS resolution issues
function cleanRedirectUrl(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    const isLocal = HADOOP_WEBHDFS_URL.includes("localhost") || HADOOP_WEBHDFS_URL.includes("127.0.0.1");
    if (isLocal) {
      url.hostname = "localhost";
    }
    return url.toString();
  } catch (err) {
    return urlStr;
  }
}

/**
 * Write a file to HDFS (creates or overwrites)
 */
export async function writeToHDFS(path: string, content: string): Promise<boolean> {
  if (!ENABLE_HADOOP) return false;

  const formattedPath = path.startsWith("/") ? path : `/${path}`;
  const initUrl = `${HADOOP_WEBHDFS_URL}${formattedPath}?op=CREATE&overwrite=true&user.name=${HADOOP_USER}`;

  try {
    // Step 1: Request redirect location from NameNode (WebHDFS CREATE init)
    const res = await nativeHttpRequest(initUrl, { method: "PUT" });

    // WebHDFS redirects CREATE request (307 Temporary Redirect)
    if (res.status === 307 || res.status === 303 || res.status === 201 || res.status === 200) {
      let uploadUrl = res.headers.location;
      if (Array.isArray(uploadUrl)) {
        uploadUrl = uploadUrl[0];
      }
      if (!uploadUrl) {
        console.error("WebHDFS CREATE: No location redirect header found.");
        return false;
      }
      uploadUrl = cleanRedirectUrl(uploadUrl);

      // Step 2: Upload content to DataNode using native HTTP to handle 100 Continue correctly
      const uploadRes = await nativeHttpRequest(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: content,
      });

      return uploadRes.status === 201 || uploadRes.status === 200;
    }
    
    console.error(`WebHDFS CREATE Init Failed. Status: ${res.status}`);
    return false;
  } catch (error) {
    console.error("HDFS Write Error:", error);
    return false;
  }
}

/**
 * Append content to an existing file in HDFS.
 * If the file does not exist, it automatically creates it.
 */
export async function appendToHDFS(path: string, content: string): Promise<boolean> {
  if (!ENABLE_HADOOP) return false;

  const formattedPath = path.startsWith("/") ? path : `/${path}`;
  const initUrl = `${HADOOP_WEBHDFS_URL}${formattedPath}?op=APPEND&user.name=${HADOOP_USER}`;

  try {
    // Step 1: Request redirect location for append
    const res = await nativeHttpRequest(initUrl, { method: "POST" });

    // If file doesn't exist, WebHDFS returns 404 (FileNotFoundException)
    if (res.status === 404) {
      console.log(`HDFS File ${formattedPath} not found. Creating it first.`);
      return await writeToHDFS(formattedPath, content);
    }

    if (res.status === 307 || res.status === 303 || res.status === 200) {
      let appendUrl = res.headers.location;
      if (Array.isArray(appendUrl)) {
        appendUrl = appendUrl[0];
      }
      if (!appendUrl) {
        console.error("WebHDFS APPEND: No location redirect header found.");
        return false;
      }
      appendUrl = cleanRedirectUrl(appendUrl);

      // Step 2: Send append content to DataNode
      const appendRes = await nativeHttpRequest(appendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: content,
      });

      if (appendRes.status === 200 || appendRes.status === 201) {
        return true;
      }

      if (appendRes.body.includes("FileNotFoundException")) {
        return await writeToHDFS(formattedPath, content);
      }
      
      console.error(`WebHDFS APPEND DataNode upload failed. Status: ${appendRes.status}`);
    }
    return false;
  } catch (error) {
    console.error("HDFS Append Error:", error);
    try {
      return await writeToHDFS(formattedPath, content);
    } catch {
      return false;
    }
  }
}
