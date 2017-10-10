#!/bin/bash
which html-minifier
if test "$?" -eq "1"; then
	npm install html-minifier -g
fi
echo "Inserting js files from $1, into $1__"
ToHtmlSingleFile.exe . $1 $1__
echo "Running html-minifier in $1__, into $2"
html-minifier --collapse-whitespace --minify-css --minify-js --remove-tag-whitespace --remove-comments --remove-attribute-quotes --html5    --output $2 -- $1__

rm $1__

