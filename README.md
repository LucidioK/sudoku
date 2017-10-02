# sudoku
Sudoku solving in pure JavaScript

# All dependencies included

Angular 1.6.6, to lay out the page.
Ocrad.js, to perform OCR.

# How to use

Download all files to a single folder, then open sudoku.html.

The familiar 9x9 sudoku layout is shown. Here you can either enter the initial numbers manually, or run OCR in a captured sudoku image.

After all initial numbers were entered, click on “Solve!”, it will run the sudoku solver and display the solution. 

# Automatically entering numbers from a captured sudoku image

If you click on the “Browse” button, you will be asked to select an image file, from an existing sudoku game. The image will be processed with Optical Character Recognition (OCR), and the digits will be placed in the associated cells. It is important to notice that the image must have the following characteristics:

1. It must be cropped so only the sudoku square is displayed.
2. Text must be vertical, white background, black letters.

The OCR is far from perfect, at least in this first version, so use it with care!
