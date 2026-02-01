// Serverless function to handle logo uploads
// This will run on Vercel's backend

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image, filename } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            console.error('Missing CLOUDINARY_CLOUD_NAME');
            return res.status(500).json({ error: 'Server Config Error: Missing Cloud Name' });
        }

        if (!process.env.CLOUDINARY_UPLOAD_PRESET) {
            console.error('Missing CLOUDINARY_UPLOAD_PRESET');
            return res.status(500).json({ error: 'Server Config Error: Missing Upload Preset' });
        }

        // Use image data URI directly (Cloudinary supports this)

        // Upload to Cloudinary (free tier: 25GB storage, 25GB bandwidth/month)
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

        const formData = {
            file: image,
            upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'startosphere_logos'
        };

        const response = await fetch(cloudinaryUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.secure_url) {
            return res.status(200).json({
                success: true,
                url: data.secure_url
            });
        } else {
            // Log the full error from Cloudinary for debugging
            console.error('Cloudinary Refusal:', data);
            throw new Error(data.error?.message || 'Unknown Cloudinary error');
        }

    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            success: false,
            error: 'Upload failed: ' + error.message
        });
    }
}
