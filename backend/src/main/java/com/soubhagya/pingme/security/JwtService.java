package com.soubhagya.pingme.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    /**
     * Generate Secret Key
     */
    private SecretKey getSigningKey() {

        byte[] keyBytes = Decoders.BASE64.decode(secret);

        return Keys.hmacShaKeyFor(keyBytes);

    }

    /**
     * Generate JWT Token bound to the user's current token version.
     */
    public String generateToken(String email) {
        return generateToken(email, 0L);
    }

    /**
     * Generate JWT Token carrying the token version for server-side revocation.
     */
    public String generateToken(String email, long tokenVersion) {

        return Jwts.builder()
                .subject(email)
                .claim("ver", tokenVersion)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();

    }

    /**
     * Extract Email
     */
    public String extractUsername(String token) {

        return extractClaim(token, Claims::getSubject);

    }

    /**
     * Extract Expiration
     */
    public Date extractExpiration(String token) {

        return extractClaim(token, Claims::getExpiration);

    }

    /**
     * Generic Claim Reader
     */
    public <T> T extractClaim(String token,
                              Function<Claims, T> resolver) {

        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return resolver.apply(claims);

    }

    /**
     * Extract token version. Tokens issued before versioning default to 0.
     */
    public long extractTokenVersion(String token) {
        Number version = extractClaim(token, claims -> claims.get("ver", Number.class));
        return version == null ? 0L : version.longValue();
    }
    /**
     * Expired?
     */
    public boolean isTokenExpired(String token) {

        return extractExpiration(token)
                .before(new Date());

    }

    /**
     * Validate Token including the token version for server-side revocation.
     */
    public boolean isTokenValid(String token,
                                String email) {
        return isTokenValid(token, email, 0L);
    }

    /**
     * Validate Token against the user's current token version.
     */
    public boolean isTokenValid(String token,
                                String email,
                                long expectedTokenVersion) {

        return extractUsername(token)
                .equals(email)
                &&
                !isTokenExpired(token)
                &&
                extractTokenVersion(token) == expectedTokenVersion;

    }

}