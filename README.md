
# Clear The Points (React)

## Mô tả
Game mini: Bấm các điểm tròn theo thứ tự tăng dần (1 → 2 → 3...) càng nhanh càng tốt. Mỗi lần bấm đúng, điểm sẽ hiện đếm ngược 2.5s rồi biến mất. Bấm sai sẽ Game Over. Có thể chọn số lượng điểm (tối đa 50,000). Có chế độ tự động chơi (Auto Play) để test tốc độ máy.

## Tính năng
- Chọn số lượng điểm (1–50,000)
- Nút Play để bắt đầu, Reset để chơi lại
- Các điểm tròn xuất hiện ngẫu nhiên, không chồng lấn
- Bấm đúng số nhỏ nhất còn lại, điểm đó sẽ đếm ngược rồi biến mất
- Bấm sai số → Game Over
- Khi hết điểm → All Cleared
- Hiển thị thời gian hoàn thành
- Có thể bấm liên tiếp, không cần đợi điểm biến mất
- Chế độ Auto Play

## Cách chạy
```fish
npm install
npm run dev
```
Mở trình duyệt tại địa chỉ in ra

## Build & Preview
```fish
npm run build
npm run preview
```

## Luật chơi
- Chỉ được bấm đúng số nhỏ nhất còn lại
- Bấm sai là thua ngay
- Có thể bấm liên tiếp các số đúng
- Khi hết điểm, thời gian sẽ dừng và hiện "All Cleared"