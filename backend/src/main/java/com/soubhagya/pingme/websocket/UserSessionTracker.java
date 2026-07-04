package com.soubhagya.pingme.websocket;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class UserSessionTracker {

    private final ConcurrentHashMap<String, AtomicInteger> sessions =
            new ConcurrentHashMap<>();

    public void connected(String email){

        sessions.compute(email,(k,v)->{

            if(v==null){

                return new AtomicInteger(1);

            }

            v.incrementAndGet();

            return v;

        });

    }

    public boolean disconnected(String email){

        AtomicInteger count = sessions.get(email);

        if(count==null){

            return true;

        }

        if(count.decrementAndGet()<=0){

            sessions.remove(email);

            return true;

        }

        return false;

    }

}