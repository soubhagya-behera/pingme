package com.soubhagya.pingme.websocket;

import java.security.Principal;

public record EmailPrincipal(String email) implements Principal {
    @Override
    public String getName() {
        return email;
    }
}
