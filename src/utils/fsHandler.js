import fs from "fs"

 
export  class FsHandler{
    /**
     *  Append an element from a given db
     * @param {string}fileName file path  
     * @param {string} message json to append to the file 
     * @param {(a)=>boolean | null } filterPredicate function that check if already exist the element (paramToCheck)=>boolen
     * @returns {{ status:boolean, message:string, isServerError:boolean}} 
     * @example 
     * append("file.txt",{test:"2"}
     * //append an item to db without testing 
     * append("file.txt",{test:"2"},(a)=>a.test=="2") 
     * //try to append {test:"2"} if don't exist an item with the same value for the test property
     */ 
    static append(fileName, message, filterPredicate = null){
        let ret = {status:false, err:null}

        if(fs.existsSync(fileName)){
            try{
                const js = JSON.parse(fs.readFileSync(fileName))
                if(filterPredicate!= null){
                    let elem = js.find((a)=>filterPredicate(a))
                    if(elem){
                        return {status: false, message:"item is not unique"};
                    }
                }
                js.push(message)
                fs.writeFileSync(fileName, JSON.stringify(js));

            }catch(err){ 
                return {status: false, message:err.stack, isServerError:true};
            }
        }else{
            try{
                
                fs.writeFileSync(fileName, JSON.stringify([message]));

            }catch(err){ 
                return {status: false, message:err.stack, isServerError:true};
            }
        }
        return {status: true, message:null};
    }

    /**
     * Read an element from a given db
     * @param {string} fileName 
     * @param {(a)=>boolean} filterPredicate 
     * @returns {{status:boolean, message:string, obj:object}}
     * @example
     * read("file.txt", (a)=>a.test =="2")
     * //find an element with the param test==2 and return in the object param of the return 
     */
    static read(fileName, filterPredicate){

        let ret = {status:false, message:null, object:null}
        if(fs.existsSync){
            try{
                const js = JSON.parse(fs.readFileSync(fileName))
             
                let elem = js.find((a)=>filterPredicate(a))
                if(!elem){
                    ret= {status: false, message:"item not found"};
                }else{
                    ret = {status:true, object:elem, message:null }
                }

               
                

            }catch(err){
                ret= {status: false, message:err.stack, isServerError:true};

            }
        }else{
            ret= {status: true,object:null, message:"there are not items in database"};

        }
        return ret;
    }

   
    /**
     * Remove an element from a given db
     * @param {string} fileName 
     * @param {(a)=>boolean} filterPredicate 
     * @returns {{status:boolean, message:string, obj:object}}
     * @example
     * remove("file.txt", (a)=>a.test =="2")
     * //if the element is found then will be removed from database
     */
    static remove(fileName, filterPredicate){
        let ret = {status:false, message:null, object:null}
        if(fs.existsSync){
            try{
                const js = JSON.parse(fs.readFileSync(fileName))
             
                let i = js.findIndex((a)=>filterPredicate(a))
                if(i === -1){
                    //element is not found
                    ret= {status: false, message:"item not found"};
                }else{
                    //element is found so is deleted from array

                    const elem = js.splice(i, 1);
                    fs.writeFileSync(fileName, JSON.stringify(js));

                    ret = {status:true, object:elem, message:null }
                }

               
                

            }catch(err){
                ret= {status: false, message:err.stack, isServerError:true};

            }
        }else{
            ret= {status: true,object:null, message:"there are not items in database"};

        }
        return ret;
    }
}