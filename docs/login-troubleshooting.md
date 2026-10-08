# Pemeriksaan login, 8 Oktober 2026

## Temuan

- Halaman `https://kampungsanan.com/login` dapat dibuka. Satu login dengan data dummy memicu exception server Next.js; tombol tetap menampilkan `Logging in...` setelah request selesai.
- `handleSubmit` sebelumnya tidak menangkap exception dan hanya mematikan loading jika Server Action mengembalikan `{ success: false }`.
- Proyek Supabase `nxvsmuhcqepcutiuhbfw` aktif. Dengan anon key publik situs, `/auth/v1/health` dan `/auth/v1/settings` memberi HTTP 200. Login dummy langsung ke API memberi HTTP 400 `invalid_credentials` dalam kurang dari satu detik.
- Artinya, koneksi dan key publik Supabase berfungsi saat pemeriksaan. Exception berada di jalur server aplikasi; pesan produksi menyembunyikan detailnya. Env runtime atau Upstash belum dapat dipastikan sebagai penyebab tanpa log Vercel.

## Env lokal yang dipulihkan

`.env.local` dibuat dari konfigurasi publik yang sudah dikirim situs ke browser. File ini diabaikan Git dan memuat:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://nxvsmuhcqepcutiuhbfw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key publik yang sudah dipulihkan di .env.local>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Service-role key, token Upstash, dan secret lain tidak tersedia dari halaman publik. Login biasa tidak memerlukan `SUPABASE_SERVICE_ROLE_KEY`; ambil key itu dari Supabase Dashboard jika diperlukan untuk fitur server yang memakainya.

## Pemeriksaan Vercel

1. Buka proyek yang melayani `kampungsanan.com`, lalu cari request `POST /login` di runtime logs. Pemeriksaan live dilakukan sekitar **10:24 WIB, 8 Oktober 2026**.
2. Pastikan environment **Production** memiliki `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dari proyek yang sama. Isi `NEXT_PUBLIC_APP_URL=https://kampungsanan.com`.
3. Jika Upstash dipakai, verifikasi `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` terhadap database Redis yang masih aktif. Key salah atau database yang sudah dihapus bisa membuat pemeriksaan rate limit melempar exception sebelum Supabase dipanggil. Jangan menghapus rate limiting sebagai perbaikan produksi.
4. Deploy ulang setelah memperbarui kode atau env. Variabel `NEXT_PUBLIC_*` juga ditanam ke bundle saat build.
5. Bila login masih gagal setelah patch, cari log `[auth:signIn]`. Field `stage` membedakan `rate-limit`, `supabase-client`, `password`, dan `profile`. Log konfigurasi Supabase hanya menampilkan apakah variabel ada, tanpa nilai key atau password.

Patch mengembalikan hasil login beserta tujuan dashboard sebagai data, sehingga exception transport dapat ditangkap di browser tanpa menelan exception redirect Next.js. Request Supabase pada login dibatasi 10 detik per request; loading dihentikan lewat `finally`. Exception Redis yang dikonfigurasi mengembalikan error login dan tidak dialihkan ke fallback in-memory.

## Verifikasi lokal

- Form kosong menampilkan validasi email/password.
- Login dummy melalui browser lokal menampilkan `Invalid login credentials`; tombol aktif kembali dan console browser tidak mencatat error.
- 16 pemeriksaan regresi lulus, meliputi kegagalan rate limiter, env server, jaringan, exception transport, batas waktu fetch, serta tujuan dashboard user/owner/admin dan deep link internal.
- TypeScript dan ESLint pada empat file yang diubah lulus.
- `npm run build` lulus, termasuk kompilasi produksi, pemeriksaan tipe/lint, dan pembuatan 35 halaman statis.

Login berhasil dengan akun asli belum diuji. Perbaikan lokal belum dideploy ke Vercel.

## Register: laporan GET 404 dan POST 500

Pengguna melaporkan kegagalan register di `kampungsanan.com`, dengan request GET 404 dan POST 500. URL GET yang kemudian diberikan adalah `cache.agilebits.com/.../richicons/images/login/120/kampungsanan.com.png`, yaitu permintaan ikon dari 1Password, bukan proses pendaftaran aplikasi. [Dokumentasi 1Password](https://support.1password.com/rich-icons-privacy/) mengonfirmasi fungsi domain cache tersebut. Pada pemeriksaan ulang, `/register` dan 17 aset statis yang dirujuk halaman memberi HTTP 200. Bundle register live masih memakai penanganan submit lama.

Form register memiliki masalah loading yang sama dengan login: exception Server Action tidak tertangkap. Patch register menambahkan `try/catch/finally`, batas waktu Supabase 10 detik per request, serta log `[auth:signUp]` dengan tahap kegagalan. Nama dan email dinormalisasi dengan menghapus spasi di awal/akhir. Pendaftaran yang berhasil mengembalikan tujuan `/login?registered=true`; halaman login menampilkan pemberitahuan keberhasilan dan instruksi konfirmasi email bila diperlukan.

Verifikasi tambahan:

- 16 pemeriksaan regresi register lulus, termasuk validasi role user/owner, penolakan role admin, email/password, batas percobaan, exception Redis/env, error jaringan/database, serta pemulihan loading dan navigasi.
- Pada browser dengan layanan Supabase simulasi lokal, form kosong menampilkan validasi; email duplikat menampilkan error; respons database HTTP 500 dan timeout menghasilkan pesan error dengan tombol kembali aktif.
- Simulasi pendaftaran owner berhasil meneruskan role yang benar dan membuka halaman login dengan pemberitahuan keberhasilan.
- Build produksi, TypeScript, dan ESLint lulus setelah perubahan register; 16 pemeriksaan login sebelumnya tetap lulus.
- Tidak ada akun produksi yang dibuat dalam pengujian ini. Keberhasilan simulasi tidak membuktikan pendaftaran di database produksi sudah pulih.

Untuk akar masalah produksi, periksa **Vercel → proyek kampungsanan.com → Logs → POST /register** dan salin pesan exception. Log yang diberikan sejauh ini masih berupa pesan generik console browser, sehingga akar exception belum diketahui. Bila patch sudah dideploy, tahap `rate-limit`, `supabase-client`, atau `signup` membantu membedakan kegagalan Upstash, konfigurasi env, dan respons Supabase. Status 500 di DevTools saja belum cukup untuk menentukan perbaikan konfigurasi atau database.
