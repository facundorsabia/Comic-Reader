import Foundation
import Cocoa

let fileManager = FileManager.default
let currentDir = fileManager.currentDirectoryPath
let outputPagesDir = (currentDir as NSString).appendingPathComponent("public/comics/pages")
let outputThumbsDir = (currentDir as NSString).appendingPathComponent("public/comics/thumbs")
let manifestPath = (currentDir as NSString).appendingPathComponent("public/comics/manifest.json")

try? fileManager.createDirectory(atPath: outputPagesDir, withIntermediateDirectories: true, attributes: nil)
try? fileManager.createDirectory(atPath: outputThumbsDir, withIntermediateDirectories: true, attributes: nil)

struct ComicPage: Codable {
    let id: Int
    let pageNumber: Int
    let src: String
    let thumb: String
    let width: Int
    let height: Int
    let aspectRatio: Double
}

struct ComicManifest: Codable {
    let title: String
    let totalPages: Int
    let pages: [ComicPage]
}

let sampleTitles = [
    "ORIGEN SECRETO: CAPÍTULO 1",
    "EL DESCUBRIMIENTO EN LAS SOMBRAS",
    "CONVERGENCIA CÓSMICA",
    "LA CIUDAD SUMERGIDA",
    "ENFRENTAMIENTO DECISIVO",
    "EL PORTAL CUÁNTICO",
    "REVELACIONES",
    "ECOS DEL PASADO",
    "LA BATALLA EN LAS ALTURAS",
    "EL DESTINO MARCADO",
    "EL RESURGIR DEL HÉROE",
    "EPÍLOGO: CONTINUARÁ..."
]

let colorThemes: [(NSColor, NSColor)] = [
    (NSColor(red: 0.10, green: 0.12, blue: 0.25, alpha: 1.0), NSColor(red: 0.95, green: 0.35, blue: 0.25, alpha: 1.0)),
    (NSColor(red: 0.12, green: 0.20, blue: 0.30, alpha: 1.0), NSColor(red: 0.20, green: 0.80, blue: 0.75, alpha: 1.0)),
    (NSColor(red: 0.25, green: 0.10, blue: 0.20, alpha: 1.0), NSColor(red: 0.95, green: 0.75, blue: 0.20, alpha: 1.0)),
    (NSColor(red: 0.15, green: 0.15, blue: 0.22, alpha: 1.0), NSColor(red: 0.45, green: 0.90, blue: 0.40, alpha: 1.0)),
    (NSColor(red: 0.20, green: 0.12, blue: 0.15, alpha: 1.0), NSColor(red: 0.95, green: 0.30, blue: 0.50, alpha: 1.0)),
    (NSColor(red: 0.08, green: 0.15, blue: 0.22, alpha: 1.0), NSColor(red: 0.35, green: 0.65, blue: 0.95, alpha: 1.0))
]

func createComicPageImage(pageIndex: Int, isCover: Bool, width: CGFloat, height: CGFloat) -> NSImage {
    let img = NSImage(size: NSSize(width: width, height: height))
    img.lockFocus()
    
    let themeIndex = pageIndex % colorThemes.count
    let (bgGradTop, accentColor) = colorThemes[themeIndex]
    
    // Background
    let bgRect = NSRect(x: 0, y: 0, width: width, height: height)
    let gradient = NSGradient(starting: bgGradTop, ending: NSColor(red: 0.05, green: 0.06, blue: 0.09, alpha: 1.0))
    gradient?.draw(in: bgRect, angle: -90.0)
    
    // Outer border (comic print margin)
    let margin: CGFloat = width * 0.04
    let printableRect = NSRect(x: margin, y: margin, width: width - (margin * 2), height: height - (margin * 2))
    
    let borderPath = NSBezierPath(roundedRect: printableRect, xRadius: 8, yRadius: 8)
    NSColor.black.withAlphaComponent(0.4).setStroke()
    borderPath.lineWidth = 4
    borderPath.stroke()
    
    if isCover {
        // COVER DESIGN
        let titleAttrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.boldSystemFont(ofSize: width * 0.075),
            .foregroundColor: NSColor.white
        ]
        let subAttrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.systemFont(ofSize: width * 0.035, weight: .semibold),
            .foregroundColor: accentColor
        ]
        
        "THE CHRONICLES OF HORIZON".draw(at: NSPoint(x: margin + 30, y: height - margin - 120), withAttributes: titleAttrs)
        "EDICIÓN ESPECIAL #01 • 56 PÁGINAS".draw(at: NSPoint(x: margin + 32, y: height - margin - 160), withAttributes: subAttrs)
        
        // Central Illustration Frame
        let centerRect = NSRect(x: margin + 40, y: margin + 200, width: printableRect.width - 80, height: printableRect.height - 400)
        let centerPath = NSBezierPath(roundedRect: centerRect, xRadius: 16, yRadius: 16)
        accentColor.withAlphaComponent(0.2).setFill()
        centerPath.fill()
        accentColor.setStroke()
        centerPath.lineWidth = 3
        centerPath.stroke()
        
        let coverText = "PORTADA DE PRUEBA"
        let coverAttrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.boldSystemFont(ofSize: width * 0.05),
            .foregroundColor: NSColor.white
        ]
        let textSize = coverText.size(withAttributes: coverAttrs)
        coverText.draw(at: NSPoint(x: centerRect.midX - textSize.width/2, y: centerRect.midY - textSize.height/2), withAttributes: coverAttrs)
        
        let tipText = "(Copia tus 56 PDFs a raw_pdfs/ y corre 'npm run convert')"
        let tipAttrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.systemFont(ofSize: width * 0.024),
            .foregroundColor: NSColor(white: 0.85, alpha: 1.0)
        ]
        let tipSize = tipText.size(withAttributes: tipAttrs)
        tipText.draw(at: NSPoint(x: centerRect.midX - tipSize.width/2, y: centerRect.midY - 50), withAttributes: tipAttrs)
        
    } else {
        // INSIDE COMIC PAGE (Panels layout)
        let pageTitle = sampleTitles[(pageIndex - 1) % sampleTitles.count]
        let headerAttrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.boldSystemFont(ofSize: width * 0.032),
            .foregroundColor: accentColor
        ]
        pageTitle.draw(at: NSPoint(x: margin + 24, y: height - margin - 50), withAttributes: headerAttrs)
        
        // 3 Comic Panels
        let panelGap: CGFloat = 16.0
        let panelWidth = printableRect.width - 40
        let panel1Height = (printableRect.height - 180) * 0.45
        let panel2Height = (printableRect.height - 180) * 0.50
        
        // Panel 1 (Top big panel)
        let p1Rect = NSRect(x: margin + 20, y: height - margin - 80 - panel1Height, width: panelWidth, height: panel1Height)
        let p1 = NSBezierPath(roundedRect: p1Rect, xRadius: 8, yRadius: 8)
        NSColor(white: 0.12, alpha: 0.9).setFill()
        p1.fill()
        NSColor(white: 0.25, alpha: 1.0).setStroke()
        p1.lineWidth = 2
        p1.stroke()
        
        // Panel 2 & 3 (Bottom split)
        let splitWidth = (panelWidth - panelGap) / 2
        let p2Rect = NSRect(x: margin + 20, y: margin + 60, width: splitWidth, height: panel2Height)
        let p3Rect = NSRect(x: margin + 20 + splitWidth + panelGap, y: margin + 60, width: splitWidth, height: panel2Height)
        
        let p2 = NSBezierPath(roundedRect: p2Rect, xRadius: 8, yRadius: 8)
        let p3 = NSBezierPath(roundedRect: p3Rect, xRadius: 8, yRadius: 8)
        NSColor(white: 0.14, alpha: 0.9).setFill()
        p2.fill()
        p3.fill()
        NSColor(white: 0.25, alpha: 1.0).setStroke()
        p2.lineWidth = 2
        p3.lineWidth = 2
        p2.stroke()
        p3.stroke()
        
        // Speech Bubble in Panel 1
        let bubbleRect = NSRect(x: p1Rect.minX + 30, y: p1Rect.maxY - 70, width: p1Rect.width - 60, height: 44)
        let bubble = NSBezierPath(roundedRect: bubbleRect, xRadius: 10, yRadius: 10)
        NSColor(white: 0.95, alpha: 1.0).setFill()
        bubble.fill()
        
        let bubbleText = "«Página demostrativa \(pageIndex) — El lector cambiará de página suavemente.»"
        let bubbleAttrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.systemFont(ofSize: width * 0.024, weight: .bold),
            .foregroundColor: NSColor.black
        ]
        bubbleText.draw(at: NSPoint(x: bubbleRect.minX + 16, y: bubbleRect.minY + 12), withAttributes: bubbleAttrs)
    }
    
    // Page Footer Number
    let pageNumStr = "— \(pageIndex) —"
    let pageNumAttrs: [NSAttributedString.Key: Any] = [
        .font: NSFont.monospacedDigitSystemFont(ofSize: width * 0.026, weight: .medium),
        .foregroundColor: NSColor(white: 0.6, alpha: 1.0)
    ]
    let numSize = pageNumStr.size(withAttributes: pageNumAttrs)
    pageNumStr.draw(at: NSPoint(x: width/2 - numSize.width/2, y: margin + 14), withAttributes: pageNumAttrs)
    
    img.unlockFocus()
    return img
}

func saveJPEG(image: NSImage, path: String) {
    guard let tiff = image.tiffRepresentation,
          let rep = NSBitmapImageRep(data: tiff),
          let data = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.9]) else { return }
    try? data.write(to: URL(fileURLWithPath: path))
}

var samplePages: [ComicPage] = []
let totalDemoPages = 16

print("✨ Generando \(totalDemoPages) páginas demostrativas...")

for i in 1...totalDemoPages {
    let formattedIndex = String(format: "%03d", i)
    let pageName = "page_\(formattedIndex).jpg"
    let thumbName = "thumb_\(formattedIndex).jpg"
    
    let pageDest = (outputPagesDir as NSString).appendingPathComponent(pageName)
    let thumbDest = (outputThumbsDir as NSString).appendingPathComponent(thumbName)
    
    let highRes = createComicPageImage(pageIndex: i, isCover: (i == 1), width: 1400, height: 2100)
    let thumb = createComicPageImage(pageIndex: i, isCover: (i == 1), width: 280, height: 420)
    
    saveJPEG(image: highRes, path: pageDest)
    saveJPEG(image: thumb, path: thumbDest)
    
    samplePages.append(ComicPage(
        id: i,
        pageNumber: i,
        src: "/comics/pages/\(pageName)",
        thumb: "/comics/thumbs/\(thumbName)",
        width: 1400,
        height: 2100,
        aspectRatio: 1400.0 / 2100.0
    ))
}

let manifest = ComicManifest(title: "Comic Preview (Demo)", totalPages: samplePages.count, pages: samplePages)
let encoder = JSONEncoder()
encoder.outputFormatting = .prettyPrinted
if let jsonData = try? encoder.encode(manifest) {
    try? jsonData.write(to: URL(fileURLWithPath: manifestPath))
}
print("✅ Páginas demo listas en public/comics/")
