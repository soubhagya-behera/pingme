package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.chat.CallSignal;

public interface CallService {

    void handleSignal(CallSignal signal, String senderEmail);

}