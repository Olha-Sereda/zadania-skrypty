#!/usr/bin/env bash

#start player position
position_x=0
position_y=0

#playground size
screen_width=3
screen_height=3
#count status screen lines
status_screen_size=5

# Current player: 1 = X, 2 = O
current_player=1

#array for screen messages
messages_array=()

#screen positions for X/O
positions=()
positions[0]="8;10"
positions[1]="8;17"
positions[2]="8;24"
positions[3]="12;10"
positions[4]="12;17"
positions[5]="12;24"
positions[6]="16;10"
positions[7]="16;17"
positions[8]="16;24"

#array field to keep 3x3 playground
field=()
for ((i=0; i<(( screen_height * screen_width )); i++)); do
    field[$i]=0
done

#array game_symbol to show positions on the playground
game_symbol=()
game_symbol[0]=" "
game_symbol[1]="X"
game_symbol[2]="O"

#savefile game
SAVE_FILE="./.tictactoe.save"

# clear status screen
cls_status () {
    for ((i=0; i<$status_screen_size; i++)); do
       echo -en "\E[$((i+20));6f                                    "
    done
}

print_status () {
    cls_status

    #get message_array element's count - ${#messages_array[@]}

    if (( ${#messages_array[@]} == 0  && $#==0 )); then
         return 1
    fi

    if (( $#>0 )); then
        messages_array+=("$1")
    fi

    if (( ${#messages_array[@]} > $status_screen_size )); then
        messages_array=("${messages_array[@]:1}")
    fi


    for ((i=0; i<${#messages_array[@]}; i++)); do
       echo -en "\E[$((i+20));6f${messages_array[$i]}"
    done
}


print_game_screen (){
    clear
    echo -en "\E[0;0f     Welcome to Tic-Tac-Toe!\n"
    cat << "EOF"

    ######################################
    #            TIC-TAC-TOE             #
    ######################################
    #                        #           #
    #        #     #         #           #
    #        #     #         #           #
    #        #     #         #  a left   #
    #  ###################   #  d right  #
    #        #     #         #  s down   #
    #        #     #         #  w up     #
    #        #     #         # [_] place #
    #  ###################   #           #
    #        #     #         #  p save   #
    #        #     #         #  l load   #
    #        #     #         #  q exit   #
    #                        #           #
    #########Messages#####################
    #                                    #
    #                                    #
    #                                    #
    #                                    #
    #                                    #
    #                                    #
    ######################################
EOF
   print_status
}


print_turn (){
    print_status " Player ${current_player} (${game_symbol[$current_player]}) turn"
}

key_input(){
    IFS= read -r -n 1 -s key
    if   [ "$key" = "s" ]; then position_y=$((position_y + 1)); if [ $position_y -ge $screen_height ]; then position_y=$((position_y - 1)); fi
    elif [ "$key" = "a" ]; then position_x=$((position_x - 1)); if [ $position_x -lt 0 ]; then position_x=$((position_x + 1)); fi
    elif [ "$key" = "w" ]; then position_y=$((position_y - 1)); if [ $position_y -lt 0 ]; then position_y=$((position_y + 1)); fi
    elif [ "$key" = "d" ]; then position_x=$((position_x + 1)); if [ $position_x -ge $screen_width ]; then position_x=$((position_x - 1)); fi
    elif [ "$key" = " " ]; then place_mark
    elif [ "$key" = "p" ]; then save_game
    elif [ "$key" = "l" ]; then load_game; print_turn
    elif [ "$key" = "q" ]; then clear; echo "Thanks for playing!"; exit 0
    fi
}

save_game(){
    {
        echo "current_player:${current_player}"
        echo "position_x:${position_x}"
        echo "position_y:${position_y}"
        echo -n "field:"
        for ((i=0; i<9; i++)); do
            if [ $i -ne 0 ]; then echo -n ","; fi
            echo -n "${field[$i]}"
        done
        echo
    } > "$SAVE_FILE"

    print_status "     Game saved."
}

load_game(){
    if [ ! -f "$SAVE_FILE" ]; then
        print_status " No save file found."
        return 1
    fi

    local line key value
    local loaded_player="" loaded_x="" loaded_y="" loaded_field=""
    while IFS= read -r line; do
        key="${line%%:*}"
        value="${line#*:}"
        case "$key" in
            current_player) loaded_player="$value" ;;
            position_x) loaded_x="$value" ;;
            position_y) loaded_y="$value" ;;
            field) loaded_field="$value"  ;;
        esac
    done < "$SAVE_FILE"

    if [[ ! "$loaded_player" =~ ^[12]$ ]]; then
        print_status " Invalid save file."
        return 1
    fi
    if [[ ! "$loaded_x" =~ ^[0-2]$ ]] || [[ ! "$loaded_y" =~ ^[0-2]$ ]]; then
        print_status " Invalid save file."
        return 1
    fi

    IFS=',' read -r -a loaded_array <<< "$loaded_field"
    if [ ${#loaded_array[@]} -ne 9 ]; then
        print_status " Invalid save file."
        return 1
    fi
    for ((i=0; i<9; i++)); do
        if [[ ! "${loaded_array[$i]}" =~ ^[012]$ ]]; then
            print_status " Invalid save file."
            return 1
        fi
    done

    current_player="$loaded_player"
    position_x="$loaded_x"
    position_y="$loaded_y"
    for ((i=0; i<9; i++)); do
        field[$i]="${loaded_array[$i]}"
    done

    print_status " Game loaded."
}

place_mark(){
    local idx=$((position_y * screen_width + position_x))
    if [ ${field[$idx]} -eq 0 ]; then
        field[$idx]=$current_player
        if [ $current_player -eq 1 ]; then
            current_player=2
        else
            current_player=1
        fi
    fi
    print_turn
}

print_cursor(){
    local idx=$((position_y * screen_width + position_x))
    local pos=${positions[$idx]}
    if [ ${field[$idx]} -eq 0 ]; then
        echo -en "\E[${pos}f@"
    else
        echo -en "\E[${pos}f${game_symbol[${field[$idx]}]}"
    fi
}

print_game_field(){
    for ((j=0; j<screen_height; j++)); do
        for ((i=0; i<screen_width; i++)); do
            local sym_pos=${positions[$((j * screen_width + i))]}
            echo -en "\E[${sym_pos}f${game_symbol[${field[$((j * screen_width + i))]}]}"
        done
    done
}

check_winner(){
    local winner=0

    local lines=(
        "0 1 2"   # row 0
        "3 4 5"   # row 1
        "6 7 8"   # row 2
        "0 3 6"   # col 0
        "1 4 7"   # col 1
        "2 5 8"   # col 2
        "0 4 8"   # diagonal
        "2 4 6"   # anti-diagonal
    )

    for line in "${lines[@]}"; do
        read -r a b c <<< "$line"
        if [ ${field[$a]} -ne 0 ]  && [ ${field[$a]} -eq ${field[$b]} ] && [ ${field[$b]} -eq ${field[$c]} ]; then
            winner=${field[$a]}
            break
        fi
    done

    echo $winner
}

check_draw(){
    for ((i=0; i<9; i++)); do
        if [ ${field[$i]} -eq 0 ]; then
            echo 0
            return
        fi
    done
    echo 1
}

game_over(){
    print_status "${1}"
    print_status " Play again? (y):"
    read -n 1 -s answer

    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        # Reset everything
        for ((i=0; i<9; i++)); do field[$i]=0; done
        position_x=0
        position_y=0
        current_player=1
        print_turn
    else
        print_status "     Thanks for playing!"
        print_status "          Exiting!"
        exit 0
    fi
}

############### Main loop ###############

print_game_screen

if [ -f "$SAVE_FILE" ]; then
    print_status " Found saved game. Load? (y/n):"
    read -n 1 -s answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        load_game
    else
        cls_status
    fi
fi

print_turn

while true; do
    print_game_screen
    print_game_field

    print_cursor

    key_input

    print_game_field
    print_cursor

    winner=$(check_winner)
    if [ $winner -ne 0 ]; then
        game_over " Player $winner (${game_symbol[$winner]}) won!"
        continue
    fi

    draw=$(check_draw)
    if [ $draw -eq 1 ]; then
        game_over " It's a draw!"
        continue
    fi
done
