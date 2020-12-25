import { ApiResponse, ApiResponseBuilder } from '../../api/domain/api-response'

export interface importForm {
    dbfile: File
}

// TODO: El archivo debería enviarse como tal, y la comprobación de si es una base de datos válida debería hacerse en el backend dependiendo del 
//  repositorio utilizado. Debido a problemas al enviar el archivo a través del fetch con mock service worker se pospone este cambio para poder
//  continuar con el desarrollo
const readFile = (file: File): Promise<object> => {
    return new Promise((resolve,reject) => {
        let reader = new FileReader()
        reader.onload = (function(theFile) {
            return function(e) {
                try{
                    let res = JSON.parse(reader.result as string)
                    resolve(res) 
                }catch(e){
                   reject('El archivo no es una base de datos válida')
                }
            };
        })(file);  
        reader.readAsText(file as File);
    })
    
}
export const importDb = async (db: importForm): Promise<ApiResponse> => {
    
    let dbfile = null
    await readFile(db.dbfile).then(
        result => {
            console.log(result)
            dbfile = result
        },
        error => {            
            throw new Error(error)            
        }
    )
    
    return await fetch('http://localhost:3000/api/db/import',{
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(dbfile)
    })
        .then(res => res.json())        
        .then(
            (result) => {              
                return result
             },
            (error) => { 
                throw new Error(error)
            }
        )
}

