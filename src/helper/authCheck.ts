/**
 * Kiểm tra định dạng Email
 * @param email
 * @returns true nếu hợp lệ, false nếu sai
 */
export const isValidEmail = (email: string): boolean => {
  // Regex cơ bản: kytu@kytu.kytu
  const emailRegex = /\S+@\S+\.\S+/;
  return emailRegex.test(email);
};

/**
 * Kiểm tra độ mạnh Mật khẩu
 * @param password
 * @returns true nếu đạt chuẩn (>= 6 ký tự), false nếu yếu
 */
export const isValidPassword = (password: string): boolean => {
  // Firebase yêu cầu tối thiểu 6 ký tự
  return password.length >= 6;
};

/**
 * (Tùy chọn) Kiểm tra số điện thoại VN
 * @param phone
 * @returns true nếu là số và đủ 10 số
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  return phoneRegex.test(phone);
};