const express = require("express");
const bodyParser = require("body-parser");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Konfigurasi Supabase
const SUPABASE_URL = "https://gbdgtqrbmwnwkajdpkmw.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZGd0cXJibXdud2thamRwa213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyMzgxMjUsImV4cCI6MjA0ODgxNDEyNX0.2XZtF4gk44k8kqpQHNrkxXE1xayzvGBCDDZVwGSJSrE"; // Masukkan ANON KEY Anda
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Halaman Utama RSVP
app.get("/", async (req, res) => {
  const { data: rsvpList, error } = await supabase
    .from("rsvp")
    .select("*")
    .order("created_at", { ascending: false });

  let listHtml = "";
  if (rsvpList && rsvpList.length > 0) {
    listHtml = rsvpList
      .map(
        (rsvp) => `
          <p>
            <strong>${rsvp.nama_tamu}</strong> (${rsvp.kehadiran})<br>
            <em>${rsvp.ucapan_doa}</em><br>
            <small>${new Date(rsvp.created_at).toLocaleString()}</small>
          </p>`
      )
      .join("");
  }

  res.send(`
    <h1>Undangan Pertunangan</h1>
    <form action="/rsvp" method="POST">
      <label>Nama Tamu:</label>
      <input type="text" name="nama_tamu" required><br>
      <label>Kehadiran:</label>
      <select name="kehadiran" required>
        <option value="Hadir">Hadir</option>
        <option value="Tidak Hadir">Tidak Hadir</option>
      </select><br>
      <label>Ucapan Doa:</label><br>
      <textarea name="ucapan_doa" rows="4" cols="30"></textarea><br>
      <button type="submit">Kirim</button>
    </form>
    <hr>
    <h2>Daftar RSVP</h2>
    ${listHtml}
  `);
});

// Menyimpan data RSVP ke database
app.post("/rsvp", async (req, res) => {
  const { nama_tamu, kehadiran, ucapan_doa } = req.body;

  const { error } = await supabase
    .from("rsvp")
    .insert([{ nama_tamu, kehadiran, ucapan_doa }]);

  if (error) {
    console.error("Error menyimpan data:", error);
    res.send("Terjadi kesalahan saat menyimpan RSVP.");
  } else {
    res.redirect("/");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
