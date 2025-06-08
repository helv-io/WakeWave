#!/bin/bash

# Check if input file is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 input.svg"
    exit 1
fi

INPUT="$1"
OUTPUT="favicon.svg"
SIZES=(144 180 192 256 384 512)  # PNG output sizes
ICON_DIR="icons"

# Check if input file exists
if [ ! -f "$INPUT" ]; then
    echo "Error: Input file '$INPUT' does not exist"
    exit 1
fi

# Check if Inkscape and ImageMagick are installed
if ! command -v inkscape &> /dev/null; then
    echo "Error: Inkscape is not installed"
    exit 1
fi

if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed"
    exit 1
fi

# Create icons directory if it doesn't exist
mkdir -p "$ICON_DIR"

# Get SVG dimensions
WIDTH=$(inkscape --query-width "$INPUT" 2>/dev/null)
HEIGHT=$(inkscape --query-height "$INPUT" 2>/dev/null)

if [ -z "$WIDTH" ] || [ -z "$HEIGHT" ]; then
    echo "Error: Could not read SVG dimensions"
    exit 1
fi

# Convert to square SVG
inkscape "$INPUT" \
    --export-filename="$OUTPUT" \
    --export-width=512 \
    --export-height=512 \
    --export-background-opacity=0 \
    --export-plain-svg 2>/dev/null

# Optimize the SVG
if command -v scour &> /dev/null; then
    scour -i "$OUTPUT" -o "temp.svg" --enable-viewboxing --enable-id-stripping \
        --enable-comment-stripping --shorten-ids --indent=none
    mv "temp.svg" "$OUTPUT"
fi

# Generate PNGs in specified sizes, respecting proportions
for SIZE in "${SIZES[@]}"; do
    # Calculate scaling to fit within square without stretching
    if [ $(bc <<< "$WIDTH > $HEIGHT") -eq 1 ]; then
        SCALE_WIDTH=$SIZE
        SCALE_HEIGHT=$(bc <<< "scale=0; $HEIGHT * $SIZE / $WIDTH" | awk '{print int($1)}')
        OFFSET_Y=$(( ($SIZE - $SCALE_HEIGHT) / 2 ))
        OFFSET_X=0
    else
        SCALE_HEIGHT=$SIZE
        SCALE_WIDTH=$(bc <<< "scale=0; $WIDTH * $SIZE / $HEIGHT" | awk '{print int($1)}')
        OFFSET_X=$(( ($SIZE - $SCALE_WIDTH) / 2 ))
        OFFSET_Y=0
    fi

    # Use ImageMagick to create square PNG with centered content
    convert -background none "$INPUT" \
        -resize "${SCALE_WIDTH}x${SCALE_HEIGHT}" \
        -gravity center \
        -extent "${SIZE}x${SIZE}" \
        "$ICON_DIR/logo-$SIZE.png"
done

echo "Created square favicon.svg (512x512)"
echo "Created PNG icons in '$ICON_DIR': logo-{${SIZES[*]}}.png (proportions preserved)"