package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.response.UserSearchResponse;
import com.soubhagya.pingme.entity.User;

import java.util.List;

public interface UserService {

    List<User> getAllUsers();

    UserSearchResponse searchUser(String email);

}