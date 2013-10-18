module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: ';'
            },
            hterm: {
                // the files to concatenate
                src: ['extern/hterm_deps.js', 'extern/hterm_resources.js', 'extern/hterm.js'],
                // the location of the resulting JS file
                dest: 'build/concat/concat.hterm.js'
            },
        //     nuttyscripts: {
        //         src:   ["scripts/app.js",
        //                 "scripts/controllers/main.js",
        //                 "scripts/controllers/master.js",
        //                 "scripts/controllers/slave.js",
        //                 "scripts/controllers/info.js",
        //                 "scripts/controllers/recordingctrl.js",
        //                 "scripts/services/Clipboard.js",
        //                 "scripts/services/NuttyUtil.js",
        //                 "scripts/controllers/MasterNavbar.js",
        //                 "scripts/services/MasterData.js",
        //                 "scripts/services/MasterConnection.js",
        //                 "scripts/directives/masterTerminal.js",
        //                 "scripts/directives/playTerminal.js",
        //                 "scripts/services/PlayTermData.js",
        //                 "scripts/services/Recording.js",
        //                 "scripts/controllers/SlaveNavbar.js",
        //                 "scripts/services/SlaveData.js",
        //                 "scripts/services/SlaveConnection.js",
        //                 "scripts/directives/slaveTerminal.js",
        //                 "scripts/directives/userDetails.js",
        //                 "scripts/services/UserDetailsData.js",
        //                 "scripts/directives/logWindow.js",
        //                 "scripts/services/log.js",
        //                 "scripts/services/Auth.js",
        //                 "scripts/services/NuttyTerm.js",
        //                 "scripts/services/recordTerminal.js"],
        //         dest: 'build/concat/concat.nuttyscripts.js'
        //     }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            hterm: {
                src: "build/concat/concat.hterm.js",
                dest: "build/concat.hterm.min.js"
            },
            // nuttyscripts: {
            //     src: 'build/concat/concat.nuttyscripts.js',
            //     dest: 'build/concat.nuttyscripts.min.js'
            // },
            peer: {
                src: 'extern/peer.js',
                dest: 'build/peer.min.js'
            },
            log4js: {
                src: 'extern/log4javascript_uncompressed.js',
                dest: 'build/log4js.min.js'
            },
            popuplib: {
                src: 'extern/popuplib.js',
                dest: 'build/popuplib.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['concat', 'uglify']);
};
