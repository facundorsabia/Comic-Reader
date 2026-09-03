import Foundation
import PDFKit
import Cocoa

let fileManager = FileManager.default
let currentDir = fileManager.currentDirectoryPath
let rawPdfDir = (currentDir as NSString).appendingPathComponent("raw_pdfs")
let outputPagesDir = (currentDir as NSString).appendingPathComponent("public/comics/pages")
let outputThumbsDir = (currentDir as NSString).appendingPathComponent("public/comics/thumbs")
let manifestPath = (currentDir as NSString).appendingPathComponent("public/comics/manifest.json")

print("🎨 \u{001B}[36mIniciando conversor de cómic para macOS...\u{001B}[0m")

try? fileManager.createDirectory(atPath: outputPagesDir, withIntermediateDirectories: true, attributes: nil)
try? fileManager.createDirectory(atPath: outputThumbsDir, withIntermediateDirectories: true, attributes: nil)

// Clean old files so only new conversions exist
if let oldPages = try? fileManager.contentsOfDirectory(atPath: outputPagesDir) {
    for f in oldPages { try? fileManager.removeItem(atPath: (outputPagesDir as NSString).appendingPathComponent(f)) }
}
if let oldThumbs = try? fileManager.contentsOfDirectory(atPath: outputThumbsDir) {
    for f in oldThumbs { try? fileManager.removeItem(atPath: (outputThumbsDir as NSString).appendingPathComponent(f)) }
}

guard let items = try? fileManager.contentsOfDirectory(atPath: rawPdfDir) else {
    print("❌ No se pudo leer el directorio: \(rawPdfDir)")
    exit(1)
}

let pdfFiles = items
    .filter { $0.lowercased().hasSuffix(".pdf") }
    .sorted { $0.localizedStandardCompare($1) == .orderedAscending }

if pdfFiles.isEmpty {
    print("⚠️  No se encontraron archivos .pdf en la carpeta: \u{001B}[33mraw_pdfs/\u{001B}[0m")
    print("👉 Por favor copia tus 56 páginas PDF allí y vuelve a ejecutar: \u{001B}[32mnpm run convert\u{001B}[0m")
    exit(0)
}

print("📚 Se encontraron \(pdfFiles.count) archivos PDF para procesar.")

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

var manifestPages: [ComicPage] = []
var globalPageIndex = 1

func saveImage(image: NSImage, targetPath: String, quality: Float) -> Bool {
    guard let tiffData = image.tiffRepresentation,
          let bitmap = NSBitmapImageRep(data: tiffData),
          let jpegData = bitmap.representation(using: .jpeg, properties: [.compressionFactor: quality]) else {
        return false
    }
    do {
        try jpegData.write(to: URL(fileURLWithPath: targetPath))
        return true
    } catch {
        return false
    }
}

for (fileIndex, pdfName) in pdfFiles.enumerated() {
    let pdfPath = (rawPdfDir as NSString).appendingPathComponent(pdfName)
    guard let pdfDoc = PDFDocument(url: URL(fileURLWithPath: pdfPath)) else {
        print("⚠️  No se pudo abrir: \(pdfName)")
        continue
    }
    
    let pageCount = pdfDoc.pageCount
    for p in 0..<pageCount {
        guard let page = pdfDoc.page(at: p) else { continue }
        let box = page.bounds(for: .mediaBox)
        
        // Target high-res width: 1600px minimum or 2x original
        let targetWidth: CGFloat = max(1600.0, box.width * 2.0)
        let scale = targetWidth / box.width
        let targetHeight = box.height * scale
        
        let highResSize = NSSize(width: targetWidth, height: targetHeight)
        let highResImg = page.thumbnail(of: highResSize, for: .mediaBox)
        
        // Thumbnail size (e.g. width ~320px)
        let thumbWidth: CGFloat = 320.0
        let thumbScale = thumbWidth / box.width
        let thumbHeight = box.height * thumbScale
        let thumbSize = NSSize(width: thumbWidth, height: thumbHeight)
        let thumbImg = page.thumbnail(of: thumbSize, for: .mediaBox)
        
        let formattedIndex = String(format: "%03d", globalPageIndex)
        let pageFilename = "page_\(formattedIndex).jpg"
        let thumbFilename = "thumb_\(formattedIndex).jpg"
        
        let pageDest = (outputPagesDir as NSString).appendingPathComponent(pageFilename)
        let thumbDest = (outputThumbsDir as NSString).appendingPathComponent(thumbFilename)
        
        _ = saveImage(image: highResImg, targetPath: pageDest, quality: 0.90)
        _ = saveImage(image: thumbImg, targetPath: thumbDest, quality: 0.80)
        
        let pageInfo = ComicPage(
            id: globalPageIndex,
            pageNumber: globalPageIndex,
            src: "/comics/pages/\(pageFilename)",
            thumb: "/comics/thumbs/\(thumbFilename)",
            width: Int(targetWidth),
            height: Int(targetHeight),
            aspectRatio: Double(targetWidth / targetHeight)
        )
        manifestPages.append(pageInfo)
        
        let percent = Int((Double(fileIndex + 1) / Double(pdfFiles.count)) * 100)
        print("\r[\(percent)%] Procesando pág \(globalPageIndex): \(pdfName)", terminator: "")
        fflush(stdout)
        
        globalPageIndex += 1
    }
}

print("\n✨ Generando manifest.json...")
var detectedTitle = "Comic Reader"
if let first = pdfFiles.first, first.lowercased().contains("ultima_pregunta") {
    detectedTitle = "La Última Pregunta"
}
let manifest = ComicManifest(title: detectedTitle, totalPages: manifestPages.count, pages: manifestPages)
let encoder = JSONEncoder()
encoder.outputFormatting = .prettyPrinted
if let jsonData = try? encoder.encode(manifest) {
    try? jsonData.write(to: URL(fileURLWithPath: manifestPath))
    print("✅ Manifest guardado en public/comics/manifest.json con \(manifestPages.count) páginas.")
}

print("🎉 \u{001B}[32m¡Conversión completada con éxito!\u{001B}[0m")
