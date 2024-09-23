const Footer = () => (
  <footer className="bg-black text-gray-500 py-8 mt-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg mb-4">Công ty</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-gray-300">
                Về chúng tôi
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-300">
                Công Việc
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-300">
                Tin Tức
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg mb-4">Trợ Giúp</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-gray-300">
                FAQ
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-300">
                Liên Hệ
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-300">
                Tài Khoản
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg mb-4">Pháp Lý</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-gray-300">
                Quyền Cá Nhân
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-300">
                Điều Khoản
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-300">
                Tùy Chọn Cookies
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg mb-4">Theo Dõi Chúng Tôi</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-gray-300">
                Facebook
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-300">
                Twitter
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-300">
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-8 text-center">
        <p>&copy; Neflix . All rights reserved.</p>
      </div>
    </div>
  </footer>
);
export default Footer;
