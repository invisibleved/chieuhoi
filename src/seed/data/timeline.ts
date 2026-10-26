// Nguyên văn từ design/source/VillagePage.dc.html (mảng `data`, 7 mốc đầu; mốc '+' "Mốc của bạn" là lời mời UI, không phải dữ liệu).
// Theo R17: khi seed JSON khác artboard thì artboard thắng. confidence/sources vẫn lấy từ content/seed/timeline.json.
export const timelineCopy: { label: string; title: string; body: string }[] = [
  { label: '1457', title: 'Phạm Đôn Lễ ra đời', body: 'Sinh tại làng Hải Triều, tức làng Hới.' },
  { label: '1481', title: 'Đỗ Tam nguyên', body: 'Đỗ đầu cả ba kỳ thi Hương, Hội và Đình dưới triều Lê Thánh Tông.' },
  {
    label: 'Thời Lê',
    title: 'Khung dệt về làng',
    body: 'Theo lời kể, khi đi sứ nhà Minh ông học kỹ thuật dệt chiếu, mua khung dệt mang về, cải tiến khung và dạy dân làng. Các nguồn chưa thống nhất về thời điểm: Vietnam+ đặt vào đầu thế kỷ XVI.',
  },
  { label: '1531', title: 'Ông Trạng mất', body: 'Dân làng tôn ông làm Phúc thần và gọi là "Trạng Chiếu".' },
  {
    label: '[?]',
    title: 'Đền thờ tổ nghề',
    body: 'Năm lập đền và cấp xếp hạng di tích chưa xác định. Báo chí ghi lễ tế tổ nghề vào mùng 6 tháng Giêng âm lịch.',
  },
  {
    label: '~2005',
    title: 'Máy dệt về làng',
    body: 'Cơ giới hoá bắt đầu khoảng năm 2005; chọn cói, viền mép, in hoa văn vẫn làm tay.',
  },
  {
    label: 'Hôm nay',
    title: 'Xã Long Hưng',
    body: 'Theo Vietnam+, làng nay thuộc xã Long Hưng, tỉnh Hưng Yên; trước đây là xã Tân Lễ, huyện Hưng Hà, tỉnh Thái Bình. Cần đối chiếu văn bản hành chính.',
  },
]
