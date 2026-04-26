export const responseFormatter = (handler) => {
   return async (req, res, next) =>{
        const result  = await handler(req,res,next)
        
        if(res.headersSent) return;

        return res.status(result?.meta?.statusCode || 200 ).json({
            success:true ,
            message: result.message || 'success',
            data: result.data || result,
            meta: result.meta || {}
        })
   }
};
