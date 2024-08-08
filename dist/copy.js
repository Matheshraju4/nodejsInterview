"use strict";
// app.post("/uploadimage", upload.single("image"), function (req, res, next) {
//     console.log(req.file.filename, req.body);
//     if (req.file?.filename) {
//       const uploadsDir = path.join(__dirname, "..", req.file?.filename);
//       console.log(uploadsDir);
//       fs.readFile(uploadsDir, (err, data) => {
//         if (err) {
//           next(); // If the file is not found, pass the request to the next middleware
//         } else {
//           res.setHeader("Content-Type", "image/jpeg");
//           res.send(data);
//         }
//       });
//     }
//     res.send({
//       filename: req.file,
//     });
//   });
