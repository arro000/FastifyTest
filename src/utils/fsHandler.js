import fs from "fs";

/**
 * Class that expose append, read, update, delete methods to handle a js db with fs
 */
export class FsHandler {
	/**
	 *  Append an element from a given db
	 * @param {string}fileName file path
	 * @param {string} message json to append to the file
	 * @param {(a)=>boolean | null } filterPredicate function that check if already exist the element (paramToCheck)=>boolen
	 * @returns {{ status:boolean, message:string, isServerError:boolean}}
	 * @example
	 * append("file.txt",{test:"2"})
	 * //append an item to db without testing
	 * append("file.txt",{test:"2"},(a)=>a.test=="2")
	 * //try to append {test:"2"} if don't exist an item with the same value for the test property
	 */
	static append(fileName, message, filterPredicate = null) {
		let ret = { status: false, err: null };

		if (fs.existsSync(fileName)) {
			try {
				let js = loadFile(fileName);
				//execute the filter function to find duplicates if is it defined
				if (filterPredicate != null) {
					let elem = js.find((a) => filterPredicate(a));
					if (elem) {
						return { status: false, message: "item is not unique" };
					}
				}

				//if there is no error push to file the new element
				js.push(message);
				fs.writeFileSync(fileName, JSON.stringify(js));
			} catch (err) {
				//fs  encountered an exception

				return {
					status: false,
					message: err.stack,
					isServerError: true,
				};
			}
		} else {
			try {
				//file not exist so we will create it from zero
				fs.writeFileSync(fileName, JSON.stringify([message]));
			} catch (err) {
				//fs  encountered an exception

				return {
					status: false,
					message: err.stack,
					isServerError: true,
				};
			}
		}
		return { status: true, message: null };
	}

	/**
	 * Read an element from a given db
	 * @param {string} fileName
	 * @param {(a)=>boolean | null } filterPredicate function that check if already exist the element (paramToCheck)=>boolen
	 * @returns {{status:boolean, message:string, obj:object}}
	 * @example
	 * read("file.txt", (a)=>a.test =="2")
	 * //find an element with the param test==2 and return in the object param of the return
	 */
	static read(fileName, filterPredicate) {
		let ret = { status: false, message: null, object: null };
		if (fs.existsSync) {
			try {
				let js = loadFile(fileName);

				let elem = js.find((a) => filterPredicate(a));
				if (!elem) {
					ret = { status: false, message: "item not found" };
				} else {
					ret = { status: true, object: elem, message: null };
				}
			} catch (err) {
				//fs  encountered an exception

				ret = {
					status: false,
					message: err.stack,
					isServerError: true,
				};
			}
		} else {
			ret = {
				status: true,
				object: null,
				message: "there are not items in database",
			};
		}
		return ret;
	}
	/**
	 * Update an element from a given db
	 * @param {string} fileName
	 * @param {string} newObject new object that replace the old
	 * @param {(a)=>boolean | null } filterPredicate function that check if already exist the element (paramToCheck)=>boolen
	 * @returns {{status:boolean, message:string, obj:object}}
	 * @example
	 * remove("file.txt",{test:"3"}, (a)=>a.test =="2")
	 * //if the element is found then will be update with new object in  database
	 */
	static update(fileName, newObject, filterPredicate) {
		let ret = { status: false, message: null, object: null };
		if (fs.existsSync) {
			try {
				let js = loadFile(fileName);

				let i = js.findIndex((a) => filterPredicate(a));
				if (i === -1) {
					//element is not found
					ret = { status: false, message: "item not found" };
				} else {
					const elem = { ...js[i], ...newObject };
					js[i] = elem;
					fs.writeFileSync(fileName, JSON.stringify(js));

					ret = { status: true, object: elem, message: null };
				}
			} catch (err) {
				//fs  encountered an exception

				ret = {
					status: false,
					message: err.stack,
					isServerError: true,
				};
			}
		} else {
			ret = {
				status: true,
				object: null,
				message: "there are not items in database",
			};
		}
		return ret;
	}

	/**
	 * Remove an element from a given db
	 * @param {string} fileName
	 * @param {(a)=>boolean | null } filterPredicate function that check if already exist the element (paramToCheck)=>boolen
	 * @returns {{status:boolean, message:string, obj:object}}
	 * @example
	 * remove("file.txt", (a)=>a.test =="2")
	 * //if the element is found then will be removed from database
	 */
	static remove(fileName, filterPredicate) {
		let ret = { status: false, message: null, object: null };
		if (fs.existsSync) {
			try {
				let js = loadFile(fileName);

				let i = js.findIndex((a) => filterPredicate(a));
				if (i === -1) {
					//element is not found
					ret = { status: false, message: "item not found" };
				} else {
					//element is found so is deleted from array

					const elem = js.splice(i, 1);
					fs.writeFileSync(fileName, JSON.stringify(js));

					ret = { status: true, object: elem, message: null };
				}
			} catch (err) {
				//fs  encountered an exception
				ret = {
					status: false,
					message: err.stack,
					isServerError: true,
				};
			}
		} else {
			ret = {
				status: true,
				object: null,
				message: "there are not items in database",
			};
		}
		return ret;
	}
}

/**
 * Handle a file on filesystem an return the json object parsed
 * @param {string} fileName
 * @returns json
 */
function loadFile(fileName) {
	const textFile = fs.readFileSync(fileName);
	let js = [];

	if (textFile.length !== 0) {
		//if file is not empty then will we parse the content
		js = JSON.parse(fs.readFileSync(fileName));
	}
	return js;
}
