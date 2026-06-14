# repo_CV_MEP — MEP Engineer CV

Nguồn dữ liệu CV Automation / Electrical / MEP Engineer.

## Nội dung

| File / thư mục | Mô tả |
| --- | --- |
| `cv.json` | Dữ liệu CV song ngữ, lấy nội dung từ `Nguyen-Phan-DuyDang_MEP_Engineer.pdf` |
| `deploy/` | Site độc lập sau khi export |

## Ghi chú hình ảnh

Avatar dùng lại ảnh thật `images/default-avatar.png`. Các chứng chỉ dùng ảnh thật đang có trong thư mục `images/`. Các hình còn lại trong phần dự án/thư viện là ảnh minh họa từ web, chỉ dùng cho ngữ cảnh MEP, điện, công trường và dự án kỹ thuật.

## Export gửi nhà tuyển dụng

```powershell
.\scripts\export-standalone.ps1 -Id mep
```

Output: `repo/repo_CV_MEP/deploy/`.
