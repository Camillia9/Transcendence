import jwt from 'jsonwebtoken';
//importe le module jsonwebtoken afin d'utiliser ses fonctions de signature et de verifications des JWT

//retourne un token JWT sous forme de chaine de caracteres (qui contient header + payload + JWT_SECRET)
export function generateToken(user){
    return jwt.sign(
        { userId: user.id }, 
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

//verifie la signature, si le token a ete creer avec la cle secrete et la date d'expiration
//retourne payload(objet)
export function verifyToken(token){
    return jwt.verify(token, process.env.JWT_SECRET);
}

// export function : rend les fonctions disponibles dans d'autres fichiers