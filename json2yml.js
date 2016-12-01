var fs = require('fs');

var cfgFile = process.argv[2];
//var cfgFile = __dirname + "/" + "network-cfg.json";
var dFile = __dirname + "/" + "docker-compose.yml";
fs.createWriteStream(dFile);

console.log('network cfg: ', cfgFile);
console.log('docker composer: ', dFile);

var cfgContent = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));

var lvl1_key = Object.keys(cfgContent);
//header 1
for ( i=0; i<lvl1_key.length; i++ ) {
    var lvl1_obj = cfgContent[lvl1_key[i]];
    var lvl2_key = Object.keys(lvl1_obj);
//            console.log('lvl1_obj: ', lvl1_obj);
//            console.log('lvl2_key: ', lvl2_key);

    // header 2
    buff = lvl1_key[i] +':' + '\n';
    fs.appendFileSync(dFile, buff);

    // header 3
    for ( k=0; k<lvl2_key.length; k++ ) {
        if ( lvl2_key[k] == 'environment' ) {
            var lvl2_obj = lvl1_obj[lvl2_key[k]];
            var lvl3_key = Object.keys(lvl2_obj);
            //console.log('lvl2_obj: ', lvl2_obj);
            //console.log('lvl3_key: ', lvl3_key);

            buff = '  ' + lvl2_key[k] + ': ' + '\n';
            fs.appendFileSync(dFile, buff);

            // header 4
            for ( m=0; m< lvl3_key.length; m++ ) {
                buff = '    - ' + lvl3_key[m] + '=' +lvl2_obj[lvl3_key[m]] + '\n';
                fs.appendFileSync(dFile, buff);

            }
        } else if ( ( lvl2_key[k] == 'image' ) || ( lvl2_key[k] == 'command' ) || ( lvl2_key[k] == 'working_dir' ) ) {
            buff = '  ' + lvl2_key[k] + ': ' + lvl1_obj[lvl2_key[k]] + '\n';
            fs.appendFileSync(dFile, buff);

        } else if ( lvl2_key[k] == 'ports' ) {
            var lvl2_obj = lvl1_obj[lvl2_key[k]];
            var lvl3_key = Object.keys(lvl2_obj);

            buff = '  ' + lvl2_key[k] + ': ' + '\n';
            fs.appendFileSync(dFile, buff);

            // header 4
            for ( m=0; m< lvl3_key.length; m++ ) {
                buff = '    - ' +lvl2_obj[lvl3_key[m]] + '\n';
                fs.appendFileSync(dFile, buff);

            }

        } else if ( ( lvl2_key[k] == 'links' ) || ( lvl2_key[k] == 'volumes' ) ){
            var lvl2_obj = lvl1_obj[lvl2_key[k]];
            var lvl3_key = Object.keys(lvl2_obj);

            buff = '  ' + lvl2_key[k] + ': ' + '\n';
            fs.appendFileSync(dFile, buff);

            // header 4
            for ( m=0; m< lvl3_key.length; m++ ) {
                buff = '    - ' +lvl2_obj[lvl3_key[m]] + '\n';
                fs.appendFileSync(dFile, buff);

            }

        } else {
            buff = '  ' + lvl2_key[k] + ': ' + '\n';
            fs.appendFileSync(dFile, buff);

            buff = '    - ' + lvl1_obj[lvl2_key[k]] + '\n';
            fs.appendFileSync(dFile, buff);

        }
    }
    // add a blank line
    buff = '\n';
    fs.appendFileSync(dFile, buff);

}
