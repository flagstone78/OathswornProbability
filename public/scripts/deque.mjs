

//doubly linked list circular buffer
export class deque{
    static #newNode(val=undefined){
        const n = [undefined,val,undefined];
        n[0] = n; n[2] = n;
        return n;
    }
    static #linkNode(prevNode,newNode,nextNode){
        prevNode[2] = newNode;
        newNode[0] = prevNode;
        newNode[2] = nextNode;
        nextNode[0] = newNode;
    }
    static #unlinkNode(node){
        node[0][2] = node[2];
        node[2][0] = node[0];
    }
    #firstElement = undefined;
    #length = 0;
    //constructor(){}
    push_back(val){
        const newNode = deque.#newNode(val);
        if(this.#length <= 0) this.#firstElement = newNode;
        else deque.#linkNode(this.#firstElement[0],newNode,this.#firstElement);
        this.#length++;
    }
    push_front(val){
        const newNode = deque.#newNode(val);
        if(this.#length <= 0) this.#firstElement = newNode;
        else deque.#linkNode(this.#firstElement,newNode,this.#firstElement[2])
        this.#length++;
    }
    pop_back(){
        if(this.#length === 0) return undefined;
        const returnNode = this.#firstElement[0];
        if(--this.#length === 0) this.#firstElement = undefined;
        else deque.#unlinkNode(returnNode);
        return returnNode[1];
    }
    pop_front(){
        if(this.#length === 0) return undefined;
        const returnNode = this.#firstElement[2];
        if(--this.#length === 0) this.#firstElement = undefined;
        else deque.#unlinkNode(returnNode);
        return returnNode[1];
    }
    get length() {return this.#length;}
}