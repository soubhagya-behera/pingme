package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.chat.CallSignal;
import com.soubhagya.pingme.service.CallService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
public class CallController {

    private final CallService callService;

    @MessageMapping("/call.signal")
    public void handleSignal(CallSignal signal, Principal principal) {
        callService.handleSignal(signal, principal.getName());
    }
}