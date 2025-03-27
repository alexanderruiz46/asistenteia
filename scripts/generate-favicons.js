const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 180, 192, 512];
const inputFile = path.join(__dirname, '../public/favicon.svg');
const outputDir = path.join(__dirname, '../public');

async function generateFavicons() {
    try {
        // Asegurarse de que el directorio de salida existe
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Generar cada tamaño
        for (const size of sizes) {
            const outputFile = path.join(outputDir, `favicon-${size}x${size}.png`);
            await sharp(inputFile)
                .resize(size, size)
                .png()
                .toFile(outputFile);
            console.log(`Generado: ${outputFile}`);
        }

        // Generar favicon.ico (multi-tamaño)
        const icoSizes = [16, 32];
        const icoBuffers = await Promise.all(
            icoSizes.map(size =>
                sharp(inputFile)
                    .resize(size, size)
                    .toBuffer()
            )
        );

        // Combinar los buffers en un solo archivo .ico
        const icoOutput = path.join(outputDir, 'favicon.ico');
        fs.writeFileSync(icoOutput, Buffer.concat(icoBuffers));
        console.log(`Generado: ${icoOutput}`);

        console.log('¡Todos los favicons han sido generados exitosamente!');
    } catch (error) {
        console.error('Error al generar los favicons:', error);
        process.exit(1);
    }
}

generateFavicons(); 