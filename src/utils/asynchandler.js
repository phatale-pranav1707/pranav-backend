const asynchandler=(fn)=>{
   async (req,res,next)=>{
          try {
            
          } catch (error) {
             res.status(error.code || 500).json({
                success : false,
                message: error.msg
             })
          }
    }
}

export {asynchandler}