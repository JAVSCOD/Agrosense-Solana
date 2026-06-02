import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { transporter } from "../utils/mailer.js";
import PDFDocument from "pdfkit";

const generarCodigo = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const registrosPendientes = new Map();

// =============================
// REGISTER: SOLO ENVÍA CÓDIGO
// =============================
export const register = async (req, res) => {
  try {
    const {
      nombres,
      primerapellido,
      segundoapellido,
      email,
      telefono,
      password,
    } = req.body;

    if (!nombres || !primerapellido || !email || !telefono || !password) {
      return res.json({
        ok: false,
        error: "Datos incompletos",
      });
    }

    const code = generarCodigo();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    registrosPendientes.set(email, {
      nombres,
      primerapellido,
      segundoapellido,
      email,
      telefono,
      password,
      verificationCode: code,
      verificationExpires: expires,
      verified: false,
    });

    await transporter.sendMail({
      from: `"AgroSense 🌱" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Código de verificación - AgroSense",
      html: `
        <h2>Bienvenido a AgroSense 🌱</h2>
        <p>Tu código de verificación es:</p>
        <h1 style="color:#00BB77">${code}</h1>
        <p>Este código expira en 5 minutos.</p>
      `,
    });

    return res.json({
      ok: true,
      message: "Código enviado al correo",
    });
  } catch (error) {
    console.error("❌ ERROR REGISTER:", error);

    return res.status(500).json({
      ok: false,
      error: "Error enviando código",
    });
  }
};

// =============================
// VERIFY CODE
// =============================
export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const pendingUser = registrosPendientes.get(email);

    if (!pendingUser) {
      return res.json({
        ok: false,
        error: "No hay registro pendiente para este correo",
      });
    }

    if (pendingUser.verificationCode !== code) {
      return res.json({
        ok: false,
        error: "Código incorrecto",
      });
    }

    if (pendingUser.verificationExpires < new Date()) {
      registrosPendientes.delete(email);

      return res.json({
        ok: false,
        error: "Código expirado",
      });
    }

    pendingUser.verified = true;
    registrosPendientes.set(email, pendingUser);

    return res.json({
      ok: true,
      message: "Correo verificado correctamente",
      user: {
        nombres: pendingUser.nombres,
        primerapellido: pendingUser.primerapellido,
        segundoapellido: pendingUser.segundoapellido,
        email: pendingUser.email,
        telefono: pendingUser.telefono,
      },
    });
  } catch (error) {
    console.error("❌ VERIFY ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "Error verificando código",
    });
  }
};

// =============================
// ENVIAR CORREO FINAL
// DESPUÉS DE REGISTRAR EN SOLANA
// =============================
export const sendRegisterSuccess = async (req, res) => {
  try {
    const { email, wallet, pda, tx } = req.body;

    const pendingUser = registrosPendientes.get(email);

    if (!pendingUser || !pendingUser.verified) {
      return res.json({
        ok: false,
        error: "El correo no ha sido verificado",
      });
    }

    await transporter.sendMail({
      from: `"AgroSense 🌱" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Registro exitoso en AgroSense-Web3",
      html: `
        <h2>Cuenta creada correctamente 🌱</h2>

        <p>Tu cuenta fue registrada exitosamente en AgroSense-Web3.</p>

        <h3>Datos de acceso</h3>
        <p><b>Nombre:</b> ${pendingUser.nombres}</p>
        <p><b>Primer apellido:</b> ${pendingUser.primerapellido}</p>
        <p><b>Segundo apellido:</b> ${pendingUser.segundoapellido || "N/A"}</p>
        <p><b>Correo:</b> ${pendingUser.email}</p>
        <p><b>Teléfono:</b> ${pendingUser.telefono}</p>

        <h3>Datos Web3</h3>
        <p><b>Wallet:</b> ${wallet}</p>
        <p><b>UserAccount PDA:</b> ${pda}</p>
        <p><b>Transacción:</b> ${tx}</p>

        <p style="color:#00BB77;">
          Ya puedes ingresar a tu dashboard.
        </p>
      `,
    });

    const usuarioFinal = {
      nombres: pendingUser.nombres,
      primerapellido: pendingUser.primerapellido,
      segundoapellido: pendingUser.segundoapellido,
      email: pendingUser.email,
      telefono: pendingUser.telefono,
      wallet,
      pda,
      authProvider: "local",
    };

    registrosPendientes.delete(email);

    return res.json({
      ok: true,
      message: "Correo final enviado",
      user: usuarioFinal,
    });
    
  } catch (error) {
    console.error("❌ SEND SUCCESS EMAIL ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "Error enviando correo final",
    });
  }
};

// =============================
// REENVIAR CÓDIGO
// =============================
export const resendCode = async (req, res) => {
  try {
    const { email } = req.body;

    const pendingUser = registrosPendientes.get(email);

    if (!pendingUser) {
      return res.json({
        ok: false,
        error: "No hay registro pendiente para este correo",
      });
    }

    const code = generarCodigo();

    pendingUser.verificationCode = code;
    pendingUser.verificationExpires = new Date(Date.now() + 5 * 60 * 1000);

    registrosPendientes.set(email, pendingUser);

    await transporter.sendMail({
      from: `"AgroSense 🌱" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Nuevo código de verificación - AgroSense",
      html: `
        <h2>Nuevo código de verificación</h2>
        <h1 style="color:#00BB77">${code}</h1>
        <p>Expira en 5 minutos.</p>
      `,
    });

    return res.json({
      ok: true,
      message: "Código reenviado",
    });
  } catch (error) {
    console.error("❌ RESEND ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "Error reenviando código",
    });
  }
};

// =============================
// CORREO DE PERFIL ACTUALIZADO
// =============================
export const sendProfileUpdated = async (req, res) => {
  try {
    const {
      email,
      nombres,
      primerApellido,
      segundoApellido,
      telefono,
      wallet,
      pda,
      tx,
    } = req.body;

    if (!email) {
      return res.json({
        ok: false,
        error: "Correo requerido",
      });
    }

    await transporter.sendMail({
      from: `"AgroSense 🌱" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Perfil actualizado - AgroSense-Web3",
      html: `
        <h2>Perfil actualizado correctamente 🌱</h2>

        <p>Se realizaron cambios en tu perfil de AgroSense-Web3.</p>

        <h3>Datos actualizados</h3>
        <p><b>Nombre:</b> ${nombres || "N/A"}</p>
        <p><b>Primer apellido:</b> ${primerApellido || "N/A"}</p>
        <p><b>Segundo apellido:</b> ${segundoApellido || "N/A"}</p>
        <p><b>Correo:</b> ${email}</p>
        <p><b>Teléfono:</b> ${telefono || "N/A"}</p>

        <h3>Datos Web3</h3>
        <p><b>Wallet:</b> ${wallet || "N/A"}</p>
        <p><b>UserAccount PDA:</b> ${pda || "N/A"}</p>
        <p><b>Transacción:</b> ${tx || "N/A"}</p>

        <p style="color:#00BB77;">
          Tus cambios fueron registrados correctamente en Solana.
        </p>
      `,
    });

    return res.json({
      ok: true,
      message: "Correo de actualización enviado",
    });
  } catch (error) {
    console.error("❌ PROFILE UPDATED EMAIL ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "Error enviando correo de actualización",
    });
  }
};

// =============================
// EXPORTAR REPORTE PDF POR CORREO
// =============================
export const exportReport = async (req, res) => {
  try {
    const {
      email,
      nombres,
      primerApellido,
      segundoApellido,
      telefono,
      wallet,
      pda,

      humedad,
      ph,
      temperatura,
      recomendacion,
      estadoBomba,

      ciudad,
      pais,
      condicionClima,
      humedadAmbiente,
      viento,
      probabilidadLluvia,
      uv,

      modoRiego,
      ultimaLectura,
      estadoEsp32,
      estadoBackend,
      estadoSolana,
      estadoNginx,
    } = req.body;

    if (!email) {
      return res.json({
        ok: false,
        error: "Correo requerido",
      });
    }

    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      bufferPages: true,
    });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    const pdfBuffer = await new Promise((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const verde = "#00BB77";
      const oscuro = "#0F172A";
      const gris = "#64748B";
      const borde = "#CBD5E1";
      const fondo = "#F8FAFC";
      const rojo = "#EF4444";

      const reporteId = `AGR-${Date.now()}`;
      const fecha = new Date().toLocaleString("es-MX");

      const drawHeader = (title = "REPORTE AGRÍCOLA INTELIGENTE") => {
        doc.rect(0, 0, 595.28, 95).fill(oscuro);

        doc
          .fillColor(verde)
          .fontSize(24)
          .font("Helvetica-Bold")
          .text("AgroSense-Web3 🌱", 40, 25);

        doc
          .fillColor("#FFFFFF")
          .fontSize(11)
          .font("Helvetica")
          .text("Plataforma inteligente de agricultura, IoT y Solana", 40, 55);

        doc
          .fillColor("#FFFFFF")
          .fontSize(13)
          .font("Helvetica-Bold")
          .text(title, 330, 30, { align: "right", width: 220 });

        doc
          .fillColor("#CBD5E1")
          .fontSize(9)
          .font("Helvetica")
          .text(`Folio: ${reporteId}`, 330, 55, { align: "right", width: 220 })
          .text(`Emitido: ${fecha}`, 330, 68, { align: "right", width: 220 });
      };

      const sectionTitle = (title, y) => {
        doc
          .fillColor(verde)
          .fontSize(13)
          .font("Helvetica-Bold")
          .text(title, 40, y);

        doc
          .moveTo(40, y + 18)
          .lineTo(555, y + 18)
          .strokeColor(borde)
          .stroke();

        return y + 30;
      };

      const box = (x, y, w, h, title, value, color = oscuro) => {
        doc
          .roundedRect(x, y, w, h, 8)
          .fillAndStroke(fondo, borde);

        doc
          .fillColor(gris)
          .fontSize(9)
          .font("Helvetica")
          .text(title, x + 12, y + 10);

        doc
          .fillColor(color)
          .fontSize(16)
          .font("Helvetica-Bold")
          .text(String(value ?? "N/A"), x + 12, y + 28, {
            width: w - 24,
          });
      };

      const row = (label, value, x, y, w = 515) => {
        doc
          .fillColor("#334155")
          .fontSize(9)
          .font("Helvetica-Bold")
          .text(label, x, y, { width: 140 });

        doc
          .fillColor("#111827")
          .fontSize(9)
          .font("Helvetica")
          .text(String(value || "N/A"), x + 145, y, { width: w - 145 });

        return y + 17;
      };

      const tableRow = (y, c1, c2, c3, c4, fill = false) => {
        if (fill) {
          doc.rect(40, y - 5, 515, 24).fill("#E2E8F0");
        }

        doc.fillColor("#111827").fontSize(9).font(fill ? "Helvetica-Bold" : "Helvetica");

        doc.text(c1, 48, y, { width: 130 });
        doc.text(c2, 180, y, { width: 110 });
        doc.text(c3, 300, y, { width: 110 });
        doc.text(c4, 420, y, { width: 120 });

        doc.moveTo(40, y + 18).lineTo(555, y + 18).strokeColor(borde).stroke();

        return y + 24;
      };

      const drawFooter = () => {
        const bottom = 790;
        doc
          .moveTo(40, bottom - 10)
          .lineTo(555, bottom - 10)
          .strokeColor(borde)
          .stroke();

        doc
          .fillColor(gris)
          .fontSize(8)
          .font("Helvetica")
          .text(
            "Documento generado automáticamente por AgroSense-Web3. Información con fines de monitoreo, análisis y soporte técnico agrícola.",
            40,
            bottom,
            { align: "center", width: 515 }
          );
      };

      // =========================
      // PÁGINA 1
      // =========================
      drawHeader();

      doc
        .fillColor(oscuro)
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("Resumen ejecutivo del monitoreo", 40, 125);

      doc
        .fillColor(gris)
        .fontSize(10)
        .font("Helvetica")
        .text(
          "Este reporte concentra la información principal del usuario, identidad Web3, condiciones agrícolas, clima, riego y estado general del sistema AgroSense-Web3.",
          40,
          150,
          { width: 515, align: "justify" }
        );

      box(40, 200, 120, 70, "Humedad suelo", `${humedad ?? "N/A"} %`, Number(humedad) <= 30 ? rojo : verde);
      box(175, 200, 120, 70, "pH", ph ?? "N/A", verde);
      box(310, 200, 120, 70, "Temperatura", `${temperatura ?? "N/A"} °C`, oscuro);
      box(445, 200, 110, 70, "Bomba", estadoBomba || "N/A", estadoBomba?.toLowerCase().includes("riego") ? verde : oscuro);

      let y = sectionTitle("Datos del usuario", 310);
      y = row("Nombre completo", `${nombres || ""} ${primerApellido || ""} ${segundoApellido || ""}`.trim(), 40, y);
      y = row("Correo", email, 40, y);
      y = row("Teléfono", telefono, 40, y);
      y = row("Tipo de cuenta", "Usuario Web3 vinculado a wallet Solana", 40, y);

      y = sectionTitle("Identidad Web3 / Solana", y + 15);
      y = row("Wallet", wallet, 40, y);
      y = row("UserAccount PDA", pda, 40, y);
      y = row("Red", "Solana Devnet", 40, y);
      y = row("Estado blockchain", estadoSolana || "Conectado / Verificable", 40, y);

      y = sectionTitle("Recomendación inteligente", y + 15);

      doc
        .roundedRect(40, y, 515, 85, 8)
        .fillAndStroke("#ECFDF5", "#86EFAC");

      doc
        .fillColor("#166534")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("Diagnóstico AgroSense", 55, y + 15);

      doc
        .fillColor("#064E3B")
        .fontSize(10)
        .font("Helvetica")
        .text(recomendacion || "Sin recomendación disponible.", 55, y + 35, {
          width: 485,
          align: "justify",
        });

      drawFooter();

      // =========================
      // PÁGINA 2
      // =========================
      doc.addPage();
      drawHeader("DETALLE AGRÍCOLA Y CLIMÁTICO");

      y = sectionTitle("Lecturas agrícolas actuales", 125);

      y = tableRow(y, "Variable", "Valor", "Estado", "Interpretación", true);
      y = tableRow(
        y,
        "Humedad del suelo",
        `${humedad ?? "N/A"} %`,
        Number(humedad) <= 30 ? "Crítico" : "Normal",
        Number(humedad) <= 30 ? "Requiere riego" : "Estable"
      );
      y = tableRow(
        y,
        "pH",
        ph ?? "N/A",
        Number(ph) >= 6 && Number(ph) <= 7.5 ? "Óptimo" : "Revisar",
        "Calidad agua/suelo"
      );
      y = tableRow(
        y,
        "Temperatura",
        `${temperatura ?? "N/A"} °C`,
        "Monitoreo",
        "Contexto ambiental"
      );
      y = tableRow(
        y,
        "Estado bomba",
        estadoBomba || "N/A",
        "Sistema",
        "Control de riego"
      );

      y = sectionTitle("Información climática", y + 20);

      box(40, y, 160, 65, "Ubicación", `${ciudad || "N/A"} ${pais || ""}`.trim());
      box(215, y, 160, 65, "Condición", condicionClima || "N/A");
      box(390, y, 165, 65, "Humedad ambiente", `${humedadAmbiente ?? "N/A"} %`);

      y += 90;

      box(40, y, 160, 65, "Viento", `${viento ?? "N/A"} km/h`);
      box(215, y, 160, 65, "Prob. lluvia", `${probabilidadLluvia ?? "N/A"} %`);
      box(390, y, 165, 65, "Índice UV", uv ?? "N/A");

      y += 100;

      y = sectionTitle("Sistema de riego", y);

      y = row("Modo de riego", modoRiego || "Automático / Manual", 40, y);
      y = row("Estado actual", estadoBomba || "N/A", 40, y);
      y = row("Última lectura", ultimaLectura || new Date().toLocaleString("es-MX"), 40, y);
      y = row("Criterio de decisión", recomendacion || "Sin recomendación disponible", 40, y);

      drawFooter();

      // =========================
      // PÁGINA 3
      // =========================
      doc.addPage();
      drawHeader("ESTADO TÉCNICO DEL SISTEMA");

      y = sectionTitle("Servicios de la plataforma", 125);

      y = tableRow(y, "Servicio", "Estado", "Función", "Observación", true);
      y = tableRow(y, "Backend Express", estadoBackend || "Activo", "API REST", "Procesa datos y correos");
      y = tableRow(y, "NGINX", estadoNginx || "Activo", "Gateway", "Expone sistema en puerto 8080");
      y = tableRow(y, "ESP32", estadoEsp32 || "Activo", "IoT", "Envía datos de sensores");
      y = tableRow(y, "Solana Devnet", estadoSolana || "Activo", "Blockchain", "Identidad Web3");
      y = tableRow(y, "Phantom Wallet", wallet ? "Conectada" : "N/A", "Autenticación", "Firma transacciones");

      y = sectionTitle("Resumen técnico", y + 25);

      doc
        .fillColor("#111827")
        .fontSize(10)
        .font("Helvetica")
        .text(
          "AgroSense-Web3 combina un dashboard web, backend API REST, comunicación IoT, envío de reportes por correo, autenticación con wallet Phantom y registro de identidad mediante Solana. El sistema permite centralizar datos agrícolas y generar reportes para seguimiento técnico y toma de decisiones.",
          40,
          y,
          { width: 515, align: "justify" }
        );

      y += 90;

      y = sectionTitle("Gráfica referencial de sensores", y);

      const chartX = 60;
      const chartY = y + 20;
      const chartW = 460;
      const chartH = 160;

      doc.rect(chartX, chartY, chartW, chartH).strokeColor(borde).stroke();

      doc
        .fillColor(gris)
        .fontSize(8)
        .text("0", chartX - 18, chartY + chartH - 5)
        .text("50", chartX - 22, chartY + chartH / 2 - 5)
        .text("100", chartX - 25, chartY - 5);

      const values = [
        Number(humedad) || 0,
        Number(ph) * 10 || 0,
        Number(temperatura) || 0,
      ];

      const labels = ["Humedad", "pH x10", "Temp"];

      values.forEach((val, i) => {
        const barH = Math.min((val / 100) * chartH, chartH);
        const x = chartX + 70 + i * 120;
        const yBar = chartY + chartH - barH;

        doc.rect(x, yBar, 50, barH).fill(verde);

        doc
          .fillColor("#111827")
          .fontSize(8)
          .text(labels[i], x - 10, chartY + chartH + 8, { width: 80, align: "center" })
          .text(String(values[i].toFixed(1)), x - 10, yBar - 15, { width: 80, align: "center" });
      });

      drawFooter();

      // =========================
      // PÁGINA 4
      // =========================
      doc.addPage();
      drawHeader("CONCLUSIÓN Y VALIDACIÓN");

      y = sectionTitle("Conclusión del reporte", 125);

      doc
        .fillColor("#111827")
        .fontSize(10)
        .font("Helvetica")
        .text(
          "Con base en las lecturas registradas, AgroSense-Web3 genera una evaluación del estado actual del cultivo y del sistema de riego. Este documento puede utilizarse como evidencia de monitoreo, soporte técnico, seguimiento operativo y validación del estado agrícola en una fecha determinada.",
          40,
          y,
          { width: 515, align: "justify" }
        );

      y += 90;

      y = sectionTitle("Validación del sistema", y);

      y = row("Folio de reporte", reporteId, 40, y);
      y = row("Fecha de emisión", fecha, 40, y);
      y = row("Generado por", "AgroSense-Web3", 40, y);
      y = row("Red blockchain", "Solana Devnet", 40, y);
      y = row("Cuenta PDA", pda, 40, y);
      y = row("Wallet vinculada", wallet, 40, y);

      y += 35;

      doc
        .roundedRect(40, y, 515, 90, 8)
        .fillAndStroke("#F8FAFC", borde);

      doc
        .fillColor(oscuro)
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("Firma digital del sistema", 55, y + 18);

      doc
        .fillColor(gris)
        .fontSize(9)
        .font("Helvetica")
        .text(
          "Este reporte fue generado automáticamente por AgroSense-Web3 y se encuentra asociado a una identidad Web3 mediante wallet Solana.",
          55,
          y + 40,
          { width: 485, align: "justify" }
        );

      doc
        .fillColor(verde)
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("AgroSense-Web3 · IoT + Solana + Agricultura Inteligente", 55, y + 68);

      drawFooter();

      doc.end();
    });

    await transporter.sendMail({
      from: `"AgroSense 🌱" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reporte agrícola profesional AgroSense-Web3",
      html: `
        <div style="font-family: Arial, sans-serif; color:#111827;">
          <h2 style="color:#00BB77;">Reporte agrícola generado 🌱</h2>
          <p>Hola <b>${nombres || "usuario"}</b>,</p>
          <p>Adjuntamos tu reporte agrícola profesional generado desde AgroSense-Web3.</p>
          <p>El documento incluye información de usuario, identidad Web3, sensores, clima, riego, estado técnico del sistema y recomendaciones.</p>
          <p style="color:#00BB77;"><b>AgroSense-Web3</b></p>
        </div>
      `,
      attachments: [
        {
          filename: `reporte-agrosense-${Date.now()}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    return res.json({
      ok: true,
      message: "Reporte PDF profesional enviado correctamente",
    });
  } catch (error) {
    console.error("❌ EXPORT REPORT ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "Error generando o enviando reporte",
    });
  }
};

