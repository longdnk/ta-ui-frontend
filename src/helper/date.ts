export const getFormattedDate = (): string => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0 nên cần +1
    const year = now.getFullYear();
    return `${day}/${month}/${year} conversation`;
};