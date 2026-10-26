# Mã nguồn thiết kế (tham khảo)

Mỗi file `.dc.html` là một artboard trên canvas Claude Design. File được viết cho runtime riêng của canvas (`<x-dc>`, `{{hole}}`, `<sc-for>`, `<sc-if>`, `class Component extends DCLogic`), **không chạy trực tiếp trong trình duyệt**.

Dùng file nguồn để tra **giá trị chính xác**: copy, khoảng cách, cỡ chữ, màu, cấu trúc DOM, thuộc tính ARIA, logic trạng thái của các tương tác (trong `renderVals()`). Muốn xem giao diện, mở ảnh chụp tương ứng trong `design/screens/`.

`canvas.json` liệt kê tất cả artboard, kèm kích thước và tiêu đề.

| Artboard | Trang |
| --- | --- |
| Home / HomeMobile / MenuMobile | `/` |
| VillagePage / VillageMobile | `/lang-hoi` |
| StoriesIndex / StoriesMobile | `/cau-chuyen` |
| StoryDetail / StoryMobile | `/cau-chuyen/[slug]` — có toàn văn bản nháp "Chuyện về Trạng Chiếu" |
| CraftPage / CraftMobile | `/nghe-det-chieu` |
| PeopleIndex / PeopleMobile | `/con-nguoi` |
| PersonDetail / PersonMobile | `/con-nguoi/[slug]` |
| ProductsIndex / ProductsMobile | `/san-pham` |
| ProductDetail / ProductMobile | `/san-pham/[slug]` |
| ArchivePage / ArchiveMobile | `/thu-vien` |
| ConnectPage / ConnectMobile | `/ket-noi` |
| Foundations / Components | Design system |
