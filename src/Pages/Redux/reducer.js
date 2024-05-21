const initialState = {
    configurations: []
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_CONFIGURATION':
            return {
                ...state,
                configurations: [...state.configurations, {
                    name: action.payload.name,
                    content: action.payload.content
                }]
            };
        default:
            return state;
    }
};

export default reducer;
