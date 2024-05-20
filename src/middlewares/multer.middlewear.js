import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")   // sarv files temp folder madhe upload hotil
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
 export const upload = multer({ storage: storage })