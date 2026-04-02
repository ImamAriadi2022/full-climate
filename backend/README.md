# back-climate

Backend Express untuk endpoint climate sesuai kontrak OpenAPI.

## Menjalankan Project

1. Install dependency

```bash
npm install
```

2. Buat file `.env` dari `.env.example`

3. Jalankan server

```bash
npm run dev
```

## Endpoint

- `GET /petengoran/topic4/latest`
- `GET /petengoran/topic4/history`
- `GET /dashboard/topic4/latest`
- `GET /dashboard/topic4/history`
- `GET /simulate/:source/topic4/latest`
- `GET /simulate/:source/topic4/history`
- `GET /health`
- `GET /docs` (Swagger UI)
- `GET /docs.json` (OpenAPI JSON)

Catatan kompatibilitas:
- Endpoint lama `GET /petengoran/topic4`, `GET /dashboard/topic4` tetap tersedia sebagai alias ke mode `history`.

Perilaku endpoint topic4:
- `latest`: ambil 1 data terbaru.
- `history`: ambil history data secara bertahap (pagination), urut terbaru ke terlama.

Query untuk endpoint `history` dan endpoint legacy:
- `limit` default `100`, maksimal `500`
- `offset` default `0`

Contoh:
- `/petengoran/topic4/history?limit=100&offset=0`
- `/petengoran/topic4/history?limit=100&offset=100`

Mode simulasi (tanpa database, untuk uji frontend):
- `/simulate/petengoran/topic4/latest`
- `/simulate/petengoran/topic4/history?limit=20&offset=0`

Troubleshooting jika muncul `relation does not exist`:
- Set nama tabel per sumber data di `.env`:
	- `TOPIC4_TABLE_PETENGORAN`
	- `TOPIC4_TABLE_DASHBOARD`
- Jika tidak diisi, API akan fallback ke `TOPIC4_TABLE`.

Format response endpoint topic4:

```json
{
	"result": []
}
```

Format error:

```json
{
	"message": "Internal Server Error"
}
```