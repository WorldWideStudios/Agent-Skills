// Print eye midpoint (fx, fy from top-left) and face width as fractions of each image, via Vision face landmarks.
import Foundation
import Vision
import CoreImage

for path in CommandLine.arguments.dropFirst() {
    guard let img = CIImage(contentsOf: URL(fileURLWithPath: path)) else { print("\(path) unreadable"); continue }
    let w = img.extent.width, h = img.extent.height
    let req = VNDetectFaceLandmarksRequest()
    try? VNImageRequestHandler(ciImage: img).perform([req])
    guard let f = (req.results ?? []).max(by: { $0.boundingBox.width < $1.boundingBox.width }) else {
        print("\((path as NSString).lastPathComponent) \(Int(w))x\(Int(h)) noface"); continue
    }
    let bb = f.boundingBox
    var ex = bb.midX, ey = bb.minY + bb.height * 0.62
    if let l = f.landmarks?.leftEye?.normalizedPoints, let r = f.landmarks?.rightEye?.normalizedPoints, !l.isEmpty, !r.isEmpty {
        let pts = l + r
        ex = bb.minX + pts.map { $0.x }.reduce(0, +) / CGFloat(pts.count) * bb.width
        ey = bb.minY + pts.map { $0.y }.reduce(0, +) / CGFloat(pts.count) * bb.height
    }
    print(String(format: "%@ %dx%d fx %.3f fy %.3f fw %.3f conf %.2f", (path as NSString).lastPathComponent, Int(w), Int(h), ex, 1 - ey, bb.width, f.confidence))
}
