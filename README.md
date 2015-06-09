Mustache File Cloner
====================

creates clones of the source file after parsing with against mustache reference file


### USAGE:
######tachecloner SOURCE_FILE CSV_FILE DEST_FOLDER
__SOURCE_FILE__ defaults to `index.html`  
__CSV_FILE__ defaults to `data.csv`  
__DEST_FOLDER__ defaults to `./clones/`. You can omit `./` and the trailing slash.  

Example: 
```sh
tachecloner index.html vars.csv clones
tachecloner -d index.html -m vars.csv -d clones
```