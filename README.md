Mustache File Cloner
====================

creates clones of the source file after parsing with against mustache reference file


### USAGE:
##### tachecloner SOURCE_FILE CSV_FILE DEST_FOLDER
__SOURCE_FILE__ defaults to `index.html`  
__CSV_FILE__ defaults to `data.csv`  
__DEST_FOLDER__ defaults to `./clones/`. You can omit `./` and the trailing slash.  

###### Example: 
```sh
tachecloner index.html vars.csv clones
tachecloner -d index.html -m vars.csv -d clones
```

###### CSV format:
__id__ will be used to generate suffixes in filenames
__var_name__ is a needle to be searched for, encapsulated inside of mustache tags

| id  | var_name | var_name_2 |
|-----|----------|------------|
| aaa | value 1  | value 4    |
| bbb | value 2  | value 5    |
| ccc | value 3  |            |


###### Source file example:
```html
<!DOCTYPE html>
<html>
    <head>
      <title>{{var_name}}</title>
    </head>

    <body>
        
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eu venenatis ante. 
        {{var_name_2}}
        Nam nec magna finibus lorem bibendum pellentesque.
      </p>

    </body>
</html>
```
