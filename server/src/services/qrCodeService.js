// src/services/qrCodeService.js
import jsQR from "jsqr"; // Biblioteca para decodificar QR code (instale via npm)

const qrCodeService = {
  decodeQRCode: (qrCodeData) => {
    const decoded = jsQR(qrCodeData, qrCodeData.width, qrCodeData.height); // Decodifica a imagem do QR code
    if (decoded) {
      // Aqui você pode definir como os dados do QR code serão formatados
      return JSON.parse(decoded.data);  // Exemplo de dado do QR code: {"id_produto": 1, "quantidade": 2}
    }
    return null;
  },
};

export default qrCodeService;
