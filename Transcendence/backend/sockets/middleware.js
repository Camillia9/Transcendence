// import jwt, { verify } from 'jsonwebtoken'
import { verifyToken } from '../shared/jwt.utils.js'

export function authMiddleware(socket, next) {
    const token = socket.handshake.auth.token
    if (!token)
        return next(new Error('Token missing'))
    try {
        socket.user = verifyToken(token);
        // socket.user = jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch {
        next(new Error('Invalid token'))
    }
}