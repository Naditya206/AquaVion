# 🐘 Panduan Integrasi Hadoop HDFS - AquaVion

Sistem AquaVion dirancang untuk dapat mengintegrasikan data telemetri IoT kolam lele ke dalam repositori **Big Data (Hadoop HDFS)**. Terdapat dua pilihan untuk menjalankan Hadoop secara lokal: menggunakan **Hadoop Windows Native** yang sudah Anda miliki, atau menggunakan **Hadoop Docker Containers**.

---

## Opsi A: Menggunakan Hadoop Windows (Native) - Rekomendasi Anda

Jika Anda sudah menginstal Hadoop secara langsung pada Windows, ikuti langkah berikut:

### 1. Konfigurasi `hdfs-site.xml`
Pastikan WebHDFS sudah diaktifkan di instalasi Hadoop Anda. Buka file `%HADOOP_HOME%\etc\hadoop\hdfs-site.xml` dan tambahkan baris konfigurasi berikut di dalam tag `<configuration>`:

```xml
<configuration>
  <!-- Mengaktifkan REST API WebHDFS -->
  <property>
    <name>dfs.webhdfs.enabled</name>
    <value>true</value>
  </property>
  
  <!-- Menonaktifkan pengecekan permission untuk mempermudah development lokal -->
  <property>
    <name>dfs.permissions.enabled</name>
    <value>false</value>
  </property>
</configuration>
```

### 2. Jalankan Layanan Hadoop
Buka command prompt / PowerShell dengan hak akses Administrator, masuk ke folder Hadoop, lalu jalankan:
```cmd
start-dfs.cmd
start-yarn.cmd
```

### 3. Konfigurasi `.env.local` di AquaVion
Buka file `.env.local` pada project Next.js dan atur variabel lingkungan berikut:
```env
# Aktifkan integrasi Hadoop
ENABLE_HADOOP=true

# Tentukan URL WebHDFS sesuai versi Hadoop Anda:
# Hadoop 3.x port defaultnya: 9870
HADOOP_WEBHDFS_URL=http://localhost:9870/webhdfs/v1

# Hadoop 2.x port defaultnya: 50070
# HADOOP_WEBHDFS_URL=http://localhost:50070/webhdfs/v1

HADOOP_USER=hadoop
```

## 📂 Cara Memeriksa Data di HDFS

1. Buka browser dan buka **Hadoop Web UI Console**: [http://localhost:9870](http://localhost:9870) (atau port `50070` jika menggunakan Hadoop 2.x).
2. Di menu atas, klik **Utilities** -> **Browse the file system**.
3. Ketik path `/aquavion/ponds` di kotak input path.
4. Anda akan melihat folder kolam Anda dan berkas `.jsonl` di dalamnya.
5. Anda dapat mengklik berkas tersebut untuk melihat data sensor yang tersimpan atau mengunduhnya langsung dari Hadoop.
