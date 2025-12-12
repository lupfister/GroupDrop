# Grouping System Flow Diagram

```mermaid
flowchart TD
    Start([Phone Movement/Interaction]) --> ProximityCheck{Phones within<br/>8.5cm proximity?}
    
    ProximityCheck -->|No| NoGroup[No Potential Group<br/>- Groups removed if phones move apart<br/>- Confirmation state lost]
    ProximityCheck -->|Yes| ConnectedComponent[Find Connected Components<br/>via BFS]
    
    ConnectedComponent --> CheckExisting{Existing Potential<br/>Group?}
    
    CheckExisting -->|Yes| UpdateGroup[Update Existing Group<br/>- Preserve confirmedIds<br/>- Update memberIds]
    CheckExisting -->|No| CheckConfirmed{Exact combination<br/>already confirmed?}
    
    CheckConfirmed -->|Yes| SkipGroup[Skip - Cannot create<br/>duplicate confirmed group]
    CheckConfirmed -->|No| CheckRepresentative{Representative<br/>Group Selected?}
    
    CheckRepresentative -->|Yes| RepGroup[Create Representative Group<br/>- Links to existing confirmed group<br/>- Adds new members when confirmed]
    CheckRepresentative -->|No| NewGroup[Create New Potential Group<br/>- All phones in proximity<br/>- confirmedIds: empty]
    
    UpdateGroup --> PotentialGroupState[Potential Group State]
    RepGroup --> PotentialGroupState
    NewGroup --> PotentialGroupState
    
    PotentialGroupState --> UserActions{User Actions}
    
    UserActions -->|Confirm| ConfirmAction[handleConfirm]
    UserActions -->|Unconfirm| UnconfirmAction[handleUnconfirm]
    UserActions -->|Remove User| RemoveAction[handleRemoveUser]
    UserActions -->|Select Representative| RepSelectAction[Select Existing Group]
    
    ConfirmAction --> AddToConfirmed[Add phone to confirmedIds<br/>in potential group]
    AddToConfirmed --> CheckAllConfirmed{All members with<br/>search open confirmed?}
    
    CheckAllConfirmed -->|No| PotentialGroupState
    CheckAllConfirmed -->|Yes| CheckRepType{Representative<br/>Group?}
    
    CheckRepType -->|Yes| MergeToConfirmed[Merge new members<br/>into existing confirmed group<br/>- Keep same group ID<br/>- Add new members]
    CheckRepType -->|No| CreateConfirmed[Create New Confirmed Group<br/>- Sequential ID: 1, 2, 3...<br/>- Permanent group<br/>- Cannot be unconfirmed]
    
    MergeToConfirmed --> ConfirmedGroupState[Confirmed Group State<br/>- Permanent<br/>- Multi-group membership allowed]
    CreateConfirmed --> ConfirmedGroupState
    
    ConfirmedGroupState --> CanJoinNew{Can join new<br/>potential groups?}
    CanJoinNew -->|Yes| ProximityCheck
    
    UnconfirmAction --> CheckInConfirmed{Phone in<br/>confirmed group?}
    CheckInConfirmed -->|Yes| BlockUnconfirm[BLOCKED<br/>Cannot unconfirm from<br/>confirmed groups]
    CheckInConfirmed -->|No| RemoveFromConfirmed[Remove from confirmedIds<br/>in potential group]
    RemoveFromConfirmed --> PotentialGroupState
    
    RemoveAction --> CheckGroupSize{Group size?}
    CheckGroupSize -->|2 members| DeleteGroup[Delete Group<br/>- Both users return home<br/>- Mark as recently removed]
    CheckGroupSize -->|3+ members| KeepGroup[Keep Group<br/>- Remove target from memberIds<br/>- Remove from confirmedIds<br/>- Remover stays in group]
    
    DeleteGroup --> HomeScreen[Home Screen State]
    KeepGroup --> PotentialGroupState
    
    RepSelectAction --> SetRepresentative[Set representativeGroupId<br/>- Sync to all phones in proximity<br/>- Sync to potential group members]
    SetRepresentative --> PotentialGroupState
    
    NoGroup --> Cleanup[Group Cleanup<br/>- Remove groups when proximity breaks<br/>- Remove groups matching confirmed<br/>- Remove groups if all in represented group]
    Cleanup --> HomeScreen
    
    style ConfirmedGroupState fill:#90EE90
    style PotentialGroupState fill:#FFE4B5
    style BlockUnconfirm fill:#FF6B6B
    style HomeScreen fill:#E0E0E0
    style CreateConfirmed fill:#90EE90
    style MergeToConfirmed fill:#90EE90
```

## Detailed Case Breakdown

### Case 1: Group Formation
```mermaid
flowchart LR
    A[Phone A] -->|8.5cm| B[Phone B]
    B -->|8.5cm| C[Phone C]
    A -.->|>8.5cm| D[Phone D]
    
    A & B --> Group1[Potential Group: A,B]
    B & C --> Group2[Potential Group: B,C]
    A & B & C --> Group3[Potential Group: A,B,C]
    
    style Group1 fill:#FFE4B5
    style Group2 fill:#FFE4B5
    style Group3 fill:#FFE4B5
```

### Case 2: Confirmation Flow
```mermaid
flowchart TD
    PG[Potential Group: A,B,C<br/>confirmedIds: empty] --> AConfirms[A confirms]
    AConfirms --> PG1[confirmedIds: A]
    PG1 --> BConfirms[B confirms]
    BConfirms --> PG2[confirmedIds: A,B]
    PG2 --> CConfirms[C confirms]
    CConfirms --> AllConfirmed{All with search<br/>open confirmed?}
    
    AllConfirmed -->|Yes| CG[Confirmed Group: A,B,C<br/>ID: 1<br/>Permanent]
    AllConfirmed -->|No| PG2
    
    style CG fill:#90EE90
    style PG fill:#FFE4B5
    style PG1 fill:#FFE4B5
    style PG2 fill:#FFE4B5
```

### Case 3: Unconfirmation Cases
```mermaid
flowchart TD
    Start{Unconfirm Action} --> InPotential{In Potential<br/>Group?}
    InPotential -->|Yes| InConfirmed{In Confirmed<br/>Group?}
    InConfirmed -->|Yes| Block[BLOCKED<br/>Cannot unconfirm]
    InConfirmed -->|No| Allow[Remove from confirmedIds<br/>Stay in potential group]
    
    InPotential -->|No| NoAction[No action needed]
    
    style Block fill:#FF6B6B
    style Allow fill:#90EE90
```

### Case 4: User Removal Cases
```mermaid
flowchart TD
    Remove[User A removes User B] --> SizeCheck{Group Size?}
    
    SizeCheck -->|2 members| Delete[Delete Group<br/>- A & B return home<br/>- Mark recently removed]
    SizeCheck -->|3+ members| Keep[Keep Group<br/>- Remove B from memberIds<br/>- Remove B from confirmedIds<br/>- A stays in group]
    
    Delete --> Home[Home Screen]
    Keep --> Continue[Group Continues<br/>with remaining members]
    
    style Delete fill:#FF6B6B
    style Keep fill:#90EE90
```

### Case 5: Representative Groups
```mermaid
flowchart TD
    Existing[Confirmed Group 1: A,B] --> Select[Phone C selects<br/>Group 1 as representative]
    Select --> RepGroup[Representative Group<br/>potential-rep-1-X<br/>members: A,B,C<br/>representativeGroupId: 1]
    
    RepGroup --> AConfirms[A confirms]
    AConfirms --> BConfirms[B confirms]
    BConfirms --> CConfirms[C confirms]
    CConfirms --> Merge[Merge C into Group 1<br/>Group 1: A,B,C<br/>Keep same ID]
    
    style Existing fill:#90EE90
    style RepGroup fill:#FFE4B5
    style Merge fill:#90EE90
```

### Case 6: Multi-Group Membership
```mermaid
flowchart TD
    PhoneA[Phone A] --> CG1[Confirmed Group 1: A,B]
    PhoneA --> CG2[Confirmed Group 2: A,C]
    
    CG1 --> NewProx{New proximity<br/>with Phone D?}
    NewProx -->|Yes| NewPG[Can form Potential Group: A,D<br/>Even though in confirmed groups]
    NewPG --> Confirm[All confirm] --> CG3[Confirmed Group 3: A,D<br/>A is now in 3 groups]
    
    style CG1 fill:#90EE90
    style CG2 fill:#90EE90
    style CG3 fill:#90EE90
    style NewPG fill:#FFE4B5
```

### Case 7: Group Cleanup Scenarios
```mermaid
flowchart TD
    Cleanup[Group Cleanup Check] --> Proximity{All members still<br/>in proximity?}
    
    Proximity -->|No| Delete1[Delete Group<br/>- Confirmation state lost]
    Proximity -->|Yes| ExactMatch{Exact combination<br/>matches confirmed?}
    
    ExactMatch -->|Yes| Delete2[Delete Group<br/>- Cannot duplicate confirmed]
    ExactMatch -->|No| RepCheck{Representative group<br/>all members in represented?}
    
    RepCheck -->|Yes| Delete3[Delete Group<br/>- All already in group]
    RepCheck -->|No| Keep[Keep Group]
    
    style Delete1 fill:#FF6B6B
    style Delete2 fill:#FF6B6B
    style Delete3 fill:#FF6B6B
    style Keep fill:#90EE90
```

### Case 8: Daisy-Chaining Detection
```mermaid
flowchart LR
    A[Phone A] -->|8.5cm| B[Phone B]
    B -->|8.5cm| C[Phone C]
    A -.->|>8.5cm| C
    
    A --> DirectB[Direct: B<br/>8.5cm]
    A --> IndirectC[Indirect: C<br/>via B<br/>isIndirect: true]
    
    style DirectB fill:#90EE90
    style IndirectC fill:#FFE4B5
```

## Key Rules Summary

1. **Proximity Threshold**: 8.5cm edge-to-edge distance
2. **Group Formation**: Dynamic, based on real-time proximity
3. **Confirmation**: All members with search open must confirm
4. **Unconfirmation**: Only from potential groups, never from confirmed
5. **Removal**: 2-member groups deleted, 3+ member groups continue
6. **Representative Groups**: Merge into existing confirmed groups
7. **Multi-Group**: Phones can be in multiple confirmed groups
8. **Cleanup**: Groups removed when proximity breaks or exact match exists



