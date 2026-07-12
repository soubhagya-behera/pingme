package com.soubhagya.pingme.dto.response;

import com.soubhagya.pingme.enums.RelationshipStatus;
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

    private RelationshipStatus relationshipStatus;

    private Long requestId;

}