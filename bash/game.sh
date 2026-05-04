#!/usr/bin/env bash

position_x=0
position_y=0

screen_width=3
screen_height=3

# Current player: 1 = X, 2 = O
current_player=1

positions=()
positions[0]="8;10"
positions[1]="8;17"
positions[2]="8;24"
positions[3]="12;11"
positions[4]="12;17"
positions[5]="12;24"
positions[6]="16;10"
positions[7]="16;17"
positions[8]="16;24"

field=()
for ((i=0; i<(( screen_height * screen_width )); i++)); do
    field[$i]=0
done

game_symbol=()
game_symbol[0]=" "
game_symbol[1]="X"
game_symbol[2]="O"


print_game_screen (){
    clear
    echo -en "\E[0;0f     Welcome to Tic-Tac-Toe!\n"
    cat << "EOF"
    ######################################
    #                                    #
    #                                    #
    ######################################
    #                        #           #
    #        #     #         #           #
    #        #     #         #           #
    #        #     #         #  a left   #
    #  ###################   #  d right  #
    #        #     #         #  s down   #
    #        #     #         #  w up     #
    #        #     #         # [space]   #
    #  ###################   #  place    #
    #        #     #         #           #
    #        #     #         #           #
    #        #     #         #           #
    #                        #           #
    # ####################################
    #                                    #
    #                                    #
    #                                    #
    ######################################
EOF
}

print_status (){
    echo -en "\E[22;4fPlayer ${current_player} (${game_symbol[$current_player]}) turn     "
}

key_input(){
    IFS= read -r -n 1 -s key
    if   [ "$key" = "s" ]; then position_y=$((position_y + 1)); if [ $position_y -ge $screen_height ]; then position_y=$((position_y - 1)); fi
    elif [ "$key" = "a" ]; then position_x=$((position_x - 1)); if [ $position_x -lt 0 ]; then position_x=$((position_x + 1)); fi
    elif [ "$key" = "w" ]; then position_y=$((position_y - 1)); if [ $position_y -lt 0 ]; then position_y=$((position_y + 1)); fi
    elif [ "$key" = "d" ]; then position_x=$((position_x + 1)); if [ $position_x -ge $screen_width ]; then position_x=$((position_x - 1)); fi
    elif [ "$key" = " " ]; then place_mark
    elif [ "$key" = "q" ]; then clear; echo "Thanks for playing!"; exit 0
    fi
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
        if [ ${field[$a]} -ne 0 ] \
        && [ ${field[$a]} -eq ${field[$b]} ] \
        && [ ${field[$b]} -eq ${field[$c]} ]; then
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
    local msg=$1
    echo -en "\E[24;4f${msg}  Play again? (y/n): "
    read -n 1 -s answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        # Reset everything
        for ((i=0; i<9; i++)); do field[$i]=0; done
        position_x=0
        position_y=0
        current_player=1
    else
        clear
        echo "Thanks for playing!"
        exit 0
    fi
}

# Main loop

print_game_screen

while true; do
    print_game_screen
    print_game_field
    print_status
    print_cursor

    key_input

    print_game_field
    print_status
    print_cursor

    winner=$(check_winner)
    if [ $winner -ne 0 ]; then
        game_over "Player $winner (${game_symbol[$winner]}) wins!"
        continue
    fi

    draw=$(check_draw)
    if [ $draw -eq 1 ]; then
        game_over "It's a draw!"
        continue
    fi
done