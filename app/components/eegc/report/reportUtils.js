import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";

// Ensure html2canvas is available globally for jsPDF
if (typeof window !== "undefined") {
  window.html2canvas = html2canvas;
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

export function createMarkdownReport(history, contributionAnalysis) {
  const now = new Date();
  let markdown = `# 📊 HKBU Learning Session Report

**Generated:** ${now.toLocaleString()}
**Total Messages:** ${history.length}

## 📈 Your Contribution Analysis

${contributionAnalysis}

## 📝 Complete Conversation

`;

  history.forEach((msg) => {
    const role = msg.role === "user" ? "👤 **You**" : "🤖 **Assistant**";
    const time = msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString() : new Date(msg.timestamp).toLocaleTimeString();
    markdown += `### ${role} (${time})

${msg.content}

`;
  });

  markdown += `---
*Created by: Dr. Simon Wang, Innovation Officer*
*Language Centre, Hong Kong Baptist University*
*simonwang@hkbu.edu.hk*`;

  return markdown;
}

export async function downloadPDF(history, contributionAnalysis) {
  if (!history.length) {
    alert("No conversation to export");
    return;
  }

  const now = new Date();
  const analysisHtml = contributionAnalysis ? md.render(contributionAnalysis) : "<p>No analysis available.</p>";

  let conversationHtml = "";
  history.forEach((msg) => {
    const role = msg.role === "user" ? "👤 You" : "🤖 Assistant";
    // 使用更清晰的时间格式
    const time = msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const contentHtml = md.render(msg.content || "");

    conversationHtml += `
      <div class="message-box" style="margin-bottom: 20px; padding: 15px; background: ${msg.role === 'user' ? '#eef6fc' : '#f8f9fa'}; border-radius: 8px; border-left: 4px solid ${msg.role === 'user' ? '#2196F3' : '#4CAF50'};">
        <div style="margin-bottom: 8px; font-weight: bold; color: #333; display: flex; justify-content: space-between;">
          <span>${role}</span>
          <span style="color: #888; font-weight: normal; font-size: 0.9em;">${time}</span>
        </div>
        <div class="markdown-body" style="font-size: 14px; line-height: 1.6; color: #24292e;">${contentHtml}</div>
      </div>
    `;
  });

  // 关键点 1: CSS 字体栈。
  // 为了确保 Emoji 正常显示，必须包含系统自带的 Emoji 字体。
  const fontStack = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`;

  const htmlContent = `
    <div id="pdf-container" style="width: 794px; margin: 0 auto; background: white; padding: 40px; box-sizing: border-box; font-family: ${fontStack};">
      <style>
        /* 简单的 Markdown 样式修正 */
        .markdown-body h1, .markdown-body h2, .markdown-body h3 { margin-top: 1em; margin-bottom: 0.5em; color: #004085; }
        .markdown-body p { margin-bottom: 1em; }
        .markdown-body code { background: rgba(27,31,35,0.05); padding: 0.2em 0.4em; border-radius: 3px; font-family: Consolas, "Liberation Mono", Menlo, monospace; }
        .markdown-body pre code { background: transparent; padding: 0; }
        .markdown-body pre { background: #f6f8fa; padding: 16px; overflow: auto; border-radius: 6px; }
        .markdown-body blockquote { border-left: 0.25em solid #dfe2e5; color: #6a737d; padding: 0 1em; margin: 0; }
      </style>
      
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px;">
         <h1 style="color: #004085; margin: 0;">HKBU Learning Session Report</h1>
         <p style="color: #666; margin: 10px 0 0 0;">Generated: ${now.toLocaleString()} | Messages: ${history.length}</p>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #004085; border-bottom: 1px solid #eee; padding-bottom: 10px;">📈 Contribution Analysis</h2>
        <div class="markdown-body" style="background: #fff; border: 1px solid #e1e4e8; padding: 20px; border-radius: 6px; margin-top: 15px;">
          ${analysisHtml}
        </div>
      </div>

      <div>
        <h2 style="color: #004085; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">📝 Complete Conversation</h2>
        <div>
          ${conversationHtml}
        </div>
      </div>

       <div style="margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #888; font-size: 0.9em;">
        <p style="margin: 5px 0;"><strong>Language Centre, Hong Kong Baptist University</strong></p>
        <p style="margin: 5px 0;">Created by: Dr. Simon Wang, Innovation Officer</p>
      </div>
    </div>
  `;

  // 创建临时容器
  const container = document.createElement("div");
  // 关键点 2: 容器不能是 display: none，否则 html2canvas 截不到。
  // 我们把它移出屏幕外，但保持可见性。
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.zIndex = "-9999";
  // 强制宽度为 A4 像素宽度 (794px at 96dpi)，保证排版一致
  container.style.width = "794px";
  container.innerHTML = DOMPurify.sanitize(htmlContent);
  document.body.appendChild(container);

  const contentElement = container.querySelector("#pdf-container");

  try {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const canvas = await html2canvas(contentElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    // --- 创建单页长 PDF (不切割内容) ---
    const a4Width = 210; // A4 宽度 (mm)

    // 设置边距 (单位: mm)
    const verticalPadding = 20; // 顶部和底部的留白高度
    const horizontalPadding = 15; // 左右留白宽度

    // 计算内容区域宽度
    const contentWidth = a4Width - (horizontalPadding * 2);

    // 根据宽度计算图片的缩放高度
    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;
    const ratio = contentWidth / imgWidthPx;
    const scaledImgHeight = imgHeightPx * ratio; // 图片缩放后的总高度 (mm)

    // 计算整个页面的高度 (图片高度 + 上下边距)
    const totalPageHeight = scaledImgHeight + (verticalPadding * 2);

    // 创建自定义高度的 PDF 页面
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [a4Width, totalPageHeight] // 宽度固定为 A4，高度动态调整
    });

    // 在页面上绘制图片 (带边距)
    doc.addImage(
      imgData,
      "JPEG",
      horizontalPadding,      // x: 左边距
      verticalPadding,        // y: 顶部边距
      contentWidth,           // 图片宽度
      scaledImgHeight,        // 图片高度
      undefined,
      "FAST"
    );

    doc.save(`HKBU_Learning_Report_${new Date().toISOString().split("T")[0]}.pdf`);

  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please check connection or try again.");
  } finally {
    // 清理临时 DOM
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

export function downloadMarkdownFile(reportText) {
  const blob = new Blob([reportText], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `HKBU_Learning_Report_${new Date().toISOString().split("T")[0]}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
