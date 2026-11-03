/* ==========================================================
   main.js
   Menyusun path foto dan file dari satu tempat.
   Di HTML cukup tulis nama filenya, folder ditambahkan oleh script ini.

   Foto  : <img data-photo="kegiatan-1.webp" alt="...">   -> assets/photo/kegiatan-1.webp
   File  : <a data-file="laporan-v1.pdf">Judul</a>        -> assets/file/laporan-v1.pdf
   ========================================================== */

// Folder dasar. Pakai path relatif (tanpa "/" di depan) supaya tetap jalan
// di GitHub Pages maupun Cloudflare Pages, termasuk kalau situs ada di subfolder.
// Kalau situs pasti di root domain (abcdef.id), boleh diganti jadi "/assets".
const ASSET_BASE = "assets";

const FOLDER = {
  photo: `${ASSET_BASE}/photo/`,
  file:  `${ASSET_BASE}/file/`,
};

// Gabungkan folder + nama file menjadi path lengkap.
// Mengembalikan null kalau nama tidak valid.
function assetPath(type, name) {
  if (!FOLDER[type] || !name) return null;

  // Tolak nama yang mencoba keluar dari folder, misalnya "../rahasia.pdf"
  if (name.includes("..") || name.startsWith("/")) {
    console.warn(`Nama ${type} tidak valid:`, name);
    return null;
  }

  // encodeURIComponent supaya spasi atau karakter khusus tidak merusak link.
  // Subfolder tetap bisa dipakai, misalnya data-photo="proyek-1/depan.webp".
  return FOLDER[type] + name.split("/").map(encodeURIComponent).join("/");
}

document.addEventListener("DOMContentLoaded", () => {

  // Foto: isi src dari atribut data-photo
  document.querySelectorAll("img[data-photo]").forEach((img) => {
    const path = assetPath("photo", img.dataset.photo);
    if (!path) return;

    img.src = path;
    img.loading = "lazy";   // foto dimuat saat mendekati layar, halaman lebih ringan
    img.addEventListener("error", () => {
      console.warn("Foto tidak ditemukan:", path);
    });
  });

  // File (PDF, dll): isi href dari atribut data-file, buka di tab baru
  document.querySelectorAll("a[data-file]").forEach((a) => {
    const path = assetPath("file", a.dataset.file);
    if (!path) return;

    a.href = path;
    a.target = "_blank";
    a.rel = "noopener";
  });

});