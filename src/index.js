import React from 'react'
import { StyleSheet, View, Text, ScrollView, TouchableHighlight, Animated, TextInput } from 'react-native'
import { searchProduct } from "./helpers/searchProduct";
import { TextInput as BaseTextInput } from 'react-native-paper';

export default class SuggestionSearchList extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            searchValue: props.initialValue,
            showResults: false,
            results: [],
            animation: new Animated.Value(0)
        }
    }


    changeSearchValue (searchValue) {
        const { startSuggestingFrom } = this.props
        this.props.inputValueChange(searchValue)
        this.setState({ searchValue }, () => {  
            if (searchValue.length >= startSuggestingFrom) {
                this.search()
            } else if (searchValue.length === 0) {
                this.setState({ showResults: false })
            }
        })
    }

    showSuggestBox () {
        const { inputStyle: { height } } = this.props
        const { results } = this.state
        const suggestBoxHeight = (height + 5) * (this.props.maxResults || results.length)

        Animated.timing(
            this.state.animation,
            {
                toValue: suggestBoxHeight,
                duration: 500,
                useNativeDriver: false
            }
        ).start()
    }

    async search () {
        const { searchValue } = this.state
        const { list } = this.props
        const results = await searchProduct(searchValue, list)
        if(results.length > 0)
            this.setState({ results, showResults: true }, () => {
                this.showSuggestBox()
            })
    }
    renderListItem (item){
        return (
        <TouchableHighlight underlayColor={this.props.listItemHighlightColor || "#fbd42c"} key={`searchlist${item.id}`} onPress={()=>{
            this.setState({
                searchValue: item.selectedItem,
                showResults: false
                })
            this.props.onListPress(item.selectedItem);
      }}>
        <View style={this.props.listItemStyle}>
            {this.props.children(item)}
        </View>
        </TouchableHighlight>)
    }

    render() {
        const { results, showResults, searchValue } = this.state
        return (
            <View>
                {this.props.reactNativePaper ? 
                <BaseTextInput
                mode="outlined"
                onChangeText={(text) => this.changeSearchValue(text)}
                value={searchValue}
                style={this.props.paperBtnStyles}
                label={this.props.placeholder}
                keyboardType={this.props.keyboardType || null}
                />  :   <TextInput
                                style={this.props.inputStyle}
                                onChangeText={(text) => this.changeSearchValue(text)}
                                value={searchValue}
                                placeholder={this.props.placeholder}
                            />}

                {
                    showResults &&
                    <Animated.View style={[this.props.suggestBoxStyle, { height: this.state.animation }]}>
                        <ScrollView>
                            {
                                results.map(item => {
                                    return this.renderListItem(item)
                                })
                            }
                        </ScrollView>
                    </Animated.View>
                }

            </View>
        )
    }
}