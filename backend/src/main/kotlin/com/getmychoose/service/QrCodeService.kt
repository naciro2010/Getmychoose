package com.getmychoose.service

import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter
import com.google.zxing.client.j2se.MatrixToImageWriter
import org.springframework.stereotype.Service
import java.io.ByteArrayOutputStream
import java.util.Base64
import java.util.UUID

@Service
class QrCodeService {

    fun generateOrderQrCode(orderId: String): String {
        return "GMC-${orderId}-${UUID.randomUUID().toString().take(8).uppercase()}"
    }

    fun generateQrCodeImage(content: String, width: Int = 200, height: Int = 200): String {
        val qrCodeWriter = QRCodeWriter()
        val bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height)

        val outputStream = ByteArrayOutputStream()
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream)

        return "data:image/png;base64,${Base64.getEncoder().encodeToString(outputStream.toByteArray())}"
    }
}
