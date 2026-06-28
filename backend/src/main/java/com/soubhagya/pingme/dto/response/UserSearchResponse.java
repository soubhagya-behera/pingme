package com.soubhagya.pingme.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSearchResponse {

    private Long id;

    private String fullName;

    private String email;

    private String profession;

    private String profilePicture;

    private Boolean online;

}