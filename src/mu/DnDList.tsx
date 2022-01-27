import { DataTypes } from '@etsoo/shared';
import React, { CSSProperties } from 'react';
import {
    DragDropContext,
    Draggable,
    Droppable,
    DropResult
} from 'react-beautiful-dnd';

/**
 * DnD list props
 */
export interface DnDListProps<D extends {}, E extends React.ElementType> {
    /**
     * Item renderer
     */
    children: (
        item: D,
        index: number,
        deleteItem: (index: number) => void,
        editItem: (newItem: D, index: number) => boolean
    ) => React.ReactNode;

    /**
     * List container component
     * https://javascript.plainenglish.io/building-a-polymorphic-component-in-react-and-typescript-d9f236950af4
     */
    Component?: E;

    /**
     * List container props
     */
    componentProps?: React.ComponentProps<E>;

    /**
     * List disabled
     */
    disabled?: boolean;

    /**
     * Get list item style callback
     */
    getItemStyle?: (isDragging: boolean, index: number) => CSSProperties;

    /**
     * Get list style callback
     */
    getListStyle?: (isDraggingOver: boolean) => CSSProperties;

    /**
     * Label field
     */
    labelField: string & keyof D;

    /**
     * Load data
     */
    loadData: (name: string) => PromiseLike<D[]>;

    /**
     * Data change handler
     */
    onChange?: (items: D[]) => void;

    /**
     * Drag end handler
     */
    onDragEnd?: (items: D[]) => void;

    /**
     * Top and bottom sides renderer
     */
    sideRenderer?: (
        top: boolean,
        addItem: (item: D) => boolean,
        addItems: (items: D[]) => number,
        reloadItems: () => void
    ) => React.ReactNode;

    /**
     * Name for hidden form input
     */
    name: string;
}

/**
 * Drag and drop list
 * https://github.com/atlassian/react-beautiful-dnd
 * @param props Props
 * @returns Component
 */
export function DnDList<
    D extends {},
    E extends React.ElementType = React.ElementType
>(props: DnDListProps<D, E>) {
    // Destruct
    const {
        children,
        Component = 'div',
        componentProps,
        disabled = false,
        getItemStyle = (_isDragging) => ({}),
        getListStyle = () => undefined,
        labelField,
        loadData,
        name,
        onChange,
        onDragEnd,
        sideRenderer
    } = props;

    // State
    const [items, setItems] = React.useState<D[]>([]);

    const changeItems = (items: D[]) => {
        // Possible to alter items with the handler
        if (onChange) onChange(items);

        // Update state
        setItems(items);
    };

    // Drag end handler
    const onDragEndLocal = (result: DropResult) => {
        // Dropped outside the list
        if (!result.destination) {
            return;
        }

        // Clone
        const newItems = [...items];

        // Removed item
        const [removed] = newItems.splice(result.source.index, 1);

        // Insert to the destination index
        newItems.splice(result.destination.index, 0, removed);

        // Update the state
        changeItems(newItems);

        // Drag end handler
        if (onDragEnd) onDragEnd(newItems);
    };

    // Add item
    const addItem = (newItem: D) => {
        // Existence check
        if (items.some((item) => item[labelField] === newItem[labelField])) {
            return false;
        }

        // Clone
        const newItems = [newItem, ...items];

        // Update the state
        changeItems(newItems);

        return true;
    };

    // Edit item
    const editItem = (newItem: D, index: number) => {
        // Existence check
        const newIndex = items.findIndex(
            (item) => item[labelField] === newItem[labelField]
        );
        if (newIndex >= 0 && newIndex != index) {
            // Label field is the same with a different item
            return false;
        }

        // Clone
        const newItems = [...items];

        // Remove the item
        newItems.splice(index, 1, newItem);

        // Update the state
        changeItems(newItems);

        return true;
    };

    // Add items
    const addItems = (inputItems: D[]) => {
        // Clone
        const newItems = [...items];

        // Insert items
        inputItems.forEach((newItem) => {
            // Existence check
            if (
                newItems.some((item) => item[labelField] == newItem[labelField])
            ) {
                return;
            }

            newItems.push(newItem);
        });

        // Update the state
        changeItems(newItems);

        return newItems.length - items.length;
    };

    // Delete item
    const deleteItem = (index: number) => {
        // Clone
        const newItems = [...items];

        // Remove the item
        newItems.splice(index, 1);

        // Update the state
        changeItems(newItems);
    };

    // Reload items
    const reloadItems = () => {
        // Load data
        loadData(name).then((items) => setItems(items));
    };

    React.useEffect(() => {
        // Load data
        reloadItems();
    }, [name]);

    // Layout
    return (
        <React.Fragment>
            {sideRenderer && sideRenderer(true, addItem, addItems, reloadItems)}
            <Component {...componentProps}>
                {disabled ? (
                    <div style={getListStyle(false)}>
                        {items.map((item, index) => {
                            // Id
                            const id = DataTypes.convert(
                                item[labelField],
                                'string'
                            );
                            if (id == null) return;

                            return (
                                <div
                                    key={id}
                                    style={getItemStyle(false, index)}
                                >
                                    {children(
                                        item,
                                        index,
                                        deleteItem,
                                        editItem
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <DragDropContext onDragEnd={onDragEndLocal}>
                        <Droppable droppableId={name}>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    style={getListStyle(
                                        snapshot.isDraggingOver
                                    )}
                                >
                                    {items.map((item, index) => {
                                        // Id
                                        const id = DataTypes.convert(
                                            item[labelField],
                                            'string'
                                        );
                                        if (id == null) return;

                                        return (
                                            <Draggable
                                                key={id}
                                                draggableId={id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            ...getItemStyle(
                                                                snapshot.isDragging,
                                                                index
                                                            ),
                                                            ...provided
                                                                .draggableProps
                                                                .style
                                                        }}
                                                    >
                                                        {children(
                                                            item,
                                                            index,
                                                            deleteItem,
                                                            editItem
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </Component>
            {sideRenderer &&
                sideRenderer(false, addItem, addItems, reloadItems)}
        </React.Fragment>
    );
}
