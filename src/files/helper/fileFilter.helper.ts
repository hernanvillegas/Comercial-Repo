

export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback:Function)=>{

    if(!file)return callback(new Error('El archivo esta vacio'), false);

    const fileExpension = file.mimetype.split('/')[1]; // se optinen la extencion 
    const validExtensions = ['jpg','jpeg','png','gif'];

    if(validExtensions.includes(fileExpension)){
        return callback(null, true)
    }

    callback(null, false);
}