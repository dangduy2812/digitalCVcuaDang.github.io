# repo_CV_Java — Software Engineer CV

Nguồn dữ liệu CV Java Backend. Master hub đọc trực tiếp từ đây — **không copy** sang thư mục khác.

## Nội dung

| Thư mục / file | Mô tả |
|----------------|-------|
| `cv.json` | Dữ liệu CV (sections, meta, contact) |
| `CV_Java_images/` | Avatar, chứng chỉ, ảnh project |
| `CV_Java_demos/` | Demo tương tác (HTML/JS) |
| `CV_Java_assets/` | File PDF tải về |
| `deploy/` | Site độc lập sau export (gitignored) |

Đường dẫn trong `cv.json` luôn **tương đối** so với thư mục này:

```
CV_Java_images/default-avatar.png
CV_Java_assets/ten-file.pdf
CV_Java_demos/vehicle-api.html
```

## Export gửi nhà tuyển dụng

```powershell
# Từ thư mục gốc repo master
.\scripts\export-standalone.ps1 -Id java
```

Output: `repo/repo_CV_Java/deploy/` — push folder này lên repo GitHub Pages riêng (public). Không có hub, không có CV khác.

Tạo repo trống trên GitHub: **cv-java-software-engineer** (public).

```powershell
cd repo/repo_CV_Java/deploy
git init
git add .
git commit -m "CV Software Engineer"
git branch -M main
git remote add origin https://github.com/dangduy2812/cv-java-software-engineer.git
git push -u origin main
```

**Link gửi NTD:** https://dangduy2812.github.io/cv-java-software-engineer/
